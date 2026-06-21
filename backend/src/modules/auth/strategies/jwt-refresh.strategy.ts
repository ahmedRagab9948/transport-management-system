import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-custom';
import { hashToken } from '../../../common/utils/crypto.util';
import { PrismaService } from '../../../prisma/prisma.service';

/**
 * Validates opaque refresh tokens from httpOnly cookies before rotation.
 * Used by the refresh endpoint via RefreshTokenGuard.
 */
@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  async validate(request: Request): Promise<{ userId: string; tokenHash: string; rawToken: string }> {
    const cookieName = this.configService.get<string>('auth.refreshCookieName', 'tms_refresh_token');
    const rawToken = request.cookies?.[cookieName];

    if (!rawToken || typeof rawToken !== 'string') {
      throw new UnauthorizedException('Refresh token is missing');
    }

    const tokenHash = hashToken(rawToken);
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    return { userId: stored.userId, tokenHash, rawToken };
  }
}
