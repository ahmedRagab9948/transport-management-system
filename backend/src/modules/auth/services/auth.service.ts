import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { AuditService } from '../../../common/services/audit.service';
import { hashToken } from '../../../common/utils/crypto.util';
import { getClientIp, getUserAgent } from '../../../common/utils/request.util';
import { PrismaService } from '../../../prisma/prisma.service';
import { LoginDto } from '../dto/login.dto';
import { VerifyOtpDto } from '../dto/verify-otp.dto';
import { AUTH_ENTITY_TYPE, AuthAuditAction } from '../enums/auth-audit-action.enum';
import { LoginResult } from '../interfaces/auth-tokens.interface';
import { AuthenticatedUser } from '../interfaces/jwt-payload.interface';
import { OtpService } from './otp.service';
import { RefreshTokenService } from './refresh-token.service';
import { TokenService } from './token.service';

type UserWithRole = {
  id: string;
  email: string;
  fullName: string;
  passwordHash: string;
  roleId: string;
  isActive: boolean;
  otpEnabled: boolean;
  deletedAt: Date | null;
  role: {
    name: string;
    rolePermissions: { permission: { key: string } }[];
  };
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly otpService: OtpService,
    private readonly tokenService: TokenService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly auditService: AuditService,
  ) {}

  private get bcryptRounds(): number {
    return this.configService.get<number>('auth.bcryptRounds', 12);
  }

  async login(dto: LoginDto, request: Request, response: Response): Promise<LoginResult> {
    const email = dto.email.trim().toLowerCase();
    const user = await this.findUserByEmail(email);

    if (!user) {
      await this.logAuthEvent({
        action: AuthAuditAction.LOGIN_FAILED,
        request,
        newValues: { email, reason: 'user_not_found' },
      });
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!passwordValid) {
      await this.logAuthEvent({
        action: AuthAuditAction.LOGIN_FAILED,
        userId: user.id,
        request,
        newValues: { email, reason: 'invalid_password' },
      });
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.otpEnabled) {
      const { id, expiresAt, code } = await this.otpService.createForUser(user.id);
      this.otpService.logOtpForDevelopment(user.email, code);

      await this.logAuthEvent({
        action: AuthAuditAction.LOGIN_OTP_SENT,
        userId: user.id,
        request,
        entityId: id,
        newValues: { email: user.email },
      });

      return {
        requiresOtp: true,
        otpSessionId: id,
        expiresAt,
      };
    }

    const tokens = await this.issueTokens(user, request, response);

    return {
      requiresOtp: false,
      ...this.toPublicAuthResponse(tokens.accessToken, tokens.user),
    };
  }

  async verifyOtp(
    dto: VerifyOtpDto,
    request: Request,
    response: Response,
  ): Promise<{ accessToken: string; user: AuthenticatedUser }> {
    try {
      const user = await this.otpService.verifyAndConsume(dto.otpSessionId, dto.code);
      const tokens = await this.issueTokens(user as UserWithRole, request, response);
      return this.toPublicAuthResponse(tokens.accessToken, tokens.user);
    } catch (error) {
      await this.logAuthEvent({
        action: AuthAuditAction.OTP_VERIFY_FAILED,
        request,
        newValues: { otpSessionId: dto.otpSessionId },
      });
      throw error;
    }
  }

  async resendOtp(otpSessionId: string, request: Request): Promise<{ otpSessionId: string; expiresAt: Date }> {
    const { id, expiresAt, code } = await this.otpService.resend(otpSessionId);

    const session = await this.prisma.otpVerification.findUnique({
      where: { id },
      include: { user: true },
    });

    if (session?.user) {
      this.otpService.logOtpForDevelopment(session.user.email, code);
      await this.logAuthEvent({
        action: AuthAuditAction.LOGIN_OTP_SENT,
        userId: session.userId,
        request,
        entityId: id,
        newValues: { resent: true },
      });
    }

    return { otpSessionId: id, expiresAt };
  }

  async refreshWithToken(
    rawToken: string,
    request: Request,
    response: Response,
  ): Promise<{ accessToken: string; user: AuthenticatedUser }> {
    const rotation = await this.refreshTokenService.rotate(rawToken, request);
    const user = await this.findUserById(rotation.userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const authenticated = this.toAuthenticatedUser(user);
    const accessToken = this.tokenService.signAccessToken(authenticated);

    this.tokenService.setRefreshTokenCookie(response, rotation.refreshToken);

    return this.toPublicAuthResponse(accessToken, authenticated);
  }

  async logout(request: Request, response: Response): Promise<{ message: string }> {
    const rawToken = this.tokenService.getRefreshTokenFromCookie(request.cookies ?? {});
    let userId: string | undefined;

    if (rawToken) {
      const tokenHash = await this.getTokenUserId(rawToken);
      userId = tokenHash?.userId;
      await this.refreshTokenService.revoke(rawToken);
    }

    this.tokenService.clearRefreshTokenCookie(response);

    await this.logAuthEvent({
      action: AuthAuditAction.LOGOUT,
      userId,
      request,
    });

    return { message: 'Logged out successfully' };
  }

  async logoutAll(userId: string, request: Request, response: Response): Promise<{ message: string }> {
    await this.refreshTokenService.revokeAllForUser(userId);
    this.tokenService.clearRefreshTokenCookie(response);

    await this.logAuthEvent({
      action: AuthAuditAction.LOGOUT_ALL,
      userId,
      request,
    });

    return { message: 'All sessions revoked successfully' };
  }

  async getProfile(userId: string): Promise<AuthenticatedUser> {
    const user = await this.findUserById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.toAuthenticatedUser(user);
  }

  async hashPassword(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.bcryptRounds);
  }

  private async issueTokens(
    user: UserWithRole,
    request: Request,
    response: Response,
  ): Promise<{ accessToken: string; user: AuthenticatedUser }> {
    const authenticated = this.toAuthenticatedUser(user);
    const accessToken = this.tokenService.signAccessToken(authenticated);
    const refresh = await this.refreshTokenService.create(user.id, request);

    this.tokenService.setRefreshTokenCookie(response, refresh.refreshToken);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await this.logAuthEvent({
      action: AuthAuditAction.LOGIN_SUCCESS,
      userId: user.id,
      request,
      newValues: { email: user.email },
    });

    return this.toPublicAuthResponse(accessToken, authenticated);
  }

  private toPublicAuthResponse(accessToken: string, user: AuthenticatedUser) {
    return { accessToken, user };
  }

  private async findUserByEmail(email: string): Promise<UserWithRole | null> {
    return this.prisma.user.findFirst({
      where: { email, deletedAt: null, isActive: true },
      include: this.userInclude(),
    });
  }

  private async findUserById(id: string): Promise<UserWithRole | null> {
    return this.prisma.user.findFirst({
      where: { id, deletedAt: null, isActive: true },
      include: this.userInclude(),
    });
  }

  private userInclude() {
    return {
      role: {
        include: {
          rolePermissions: {
            include: { permission: true },
          },
        },
      },
    };
  }

  private toAuthenticatedUser(user: UserWithRole): AuthenticatedUser {
    const permissions = user.role.rolePermissions.map((rp) => rp.permission.key);

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      roleId: user.roleId,
      roleName: user.role.name,
      permissions,
    };
  }

  private async getTokenUserId(rawToken: string): Promise<{ userId: string } | null> {
    const record = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: hashToken(rawToken) },
      select: { userId: true },
    });

    return record;
  }

  private async logAuthEvent(params: {
    action: AuthAuditAction;
    userId?: string;
    request: Request;
    entityId?: string;
    newValues?: Prisma.InputJsonValue;
    oldValues?: Prisma.InputJsonValue;
  }): Promise<void> {
    await this.auditService.log({
      userId: params.userId,
      action: params.action,
      entityType: AUTH_ENTITY_TYPE,
      entityId: params.entityId,
      oldValues: params.oldValues,
      newValues: params.newValues,
      ipAddress: getClientIp(params.request),
      userAgent: getUserAgent(params.request),
    });
  }
}
