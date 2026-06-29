import { WEEK_MS, DAY_MS } from '@tms/shared';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { AuditService } from '../../../common/services/audit.service';
import {
  generateSecureToken,
  generateTokenFamilyId,
  hashToken,
} from '../../../common/utils/crypto.util';
import { getClientIp, getUserAgent } from '../../../common/utils/request.util';
import { PrismaService } from '../../../prisma/prisma.service';
import { AUTH_ENTITY_TYPE, AuthAuditAction } from '../enums/auth-audit-action.enum';

export interface RefreshRotationResult {
  refreshToken: string;
  familyId: string;
  userId: string;
}

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly auditService: AuditService,
  ) {}

  private get refreshExpiresIn(): string {
    return this.configService.get<string>('jwt.refreshExpiresIn', '7d');
  }

  private computeExpiresAt(): Date {
    const ms = this.parseExpiresInMs(this.refreshExpiresIn);
    return new Date(Date.now() + ms);
  }

  async create(
    userId: string,
    request: Request,
    familyId?: string,
  ): Promise<RefreshRotationResult> {
    const rawToken = generateSecureToken(48);
    const tokenHash = hashToken(rawToken);
    const resolvedFamilyId = familyId ?? generateTokenFamilyId();

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        familyId: resolvedFamilyId,
        expiresAt: this.computeExpiresAt(),
        ipAddress: getClientIp(request),
        userAgent: getUserAgent(request),
      },
    });

    return {
      refreshToken: rawToken,
      familyId: resolvedFamilyId,
      userId,
    };
  }

  async rotate(rawToken: string, request: Request): Promise<RefreshRotationResult> {
    const tokenHash = hashToken(rawToken);
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    const ipAddress = getClientIp(request);
    const userAgent = getUserAgent(request);

    if (!stored) {
      await this.auditService.log({
        action: AuthAuditAction.TOKEN_REFRESH_FAILED,
        entityType: AUTH_ENTITY_TYPE,
        newValues: { reason: 'token_not_found' },
        ipAddress,
        userAgent,
      });
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (stored.revokedAt) {
      await this.revokeFamily(stored.familyId);
      await this.auditService.log({
        userId: stored.userId,
        action: AuthAuditAction.TOKEN_REUSE_DETECTED,
        entityType: AUTH_ENTITY_TYPE,
        entityId: stored.id,
        newValues: { familyId: stored.familyId },
        ipAddress,
        userAgent,
      });
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    if (stored.expiresAt < new Date()) {
      await this.prisma.refreshToken.update({
        where: { id: stored.id },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException('Refresh token has expired');
    }

    const newToken = generateSecureToken(48);
    const newHash = hashToken(newToken);

    const created = await this.prisma.$transaction(async (tx) => {
      const newRecord = await tx.refreshToken.create({
        data: {
          userId: stored.userId,
          tokenHash: newHash,
          familyId: stored.familyId,
          expiresAt: this.computeExpiresAt(),
          ipAddress,
          userAgent,
        },
      });

      await tx.refreshToken.update({
        where: { id: stored.id },
        data: {
          revokedAt: new Date(),
          replacedBy: newRecord.id,
        },
      });

      return newRecord;
    });

    await this.auditService.log({
      userId: stored.userId,
      action: AuthAuditAction.TOKEN_REFRESH,
      entityType: AUTH_ENTITY_TYPE,
      entityId: created.id,
      ipAddress,
      userAgent,
    });

    return {
      refreshToken: newToken,
      familyId: stored.familyId,
      userId: stored.userId,
    };
  }

  async revoke(rawToken: string): Promise<void> {
    const tokenHash = hashToken(rawToken);

    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private async revokeFamily(familyId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { familyId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private parseExpiresInMs(value: string): number {
    const match = /^(\d+)([smhd])$/.exec(value.trim());

    if (!match) {
      return WEEK_MS;
    }

    const amount = parseInt(match[1], 10);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: DAY_MS,
    };

    return amount * (multipliers[unit] ?? multipliers.d);
  }
}
