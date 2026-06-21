import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { JwtAccessPayload } from '../interfaces/jwt-payload.interface';
import { AuthenticatedUser } from '../interfaces/jwt-payload.interface';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  signAccessToken(user: AuthenticatedUser): string {
    const payload: JwtAccessPayload = {
      sub: user.id,
      email: user.email,
      roleId: user.roleId,
      roleName: user.roleName,
      type: 'access',
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>('jwt.accessSecret'),
      expiresIn: this.configService.get<string>('jwt.accessExpiresIn', '15m') as `${number}${'s' | 'm' | 'h' | 'd'}`,
    });
  }

  setRefreshTokenCookie(response: Response, refreshToken: string): void {
    const maxAgeMs = this.parseExpiresInMs(
      this.configService.get<string>('jwt.refreshExpiresIn', '7d'),
    );

    response.cookie(
      this.configService.get<string>('auth.refreshCookieName', 'tms_refresh_token'),
      refreshToken,
      {
        httpOnly: true,
        secure: this.configService.get<boolean>('auth.cookieSecure', false),
        sameSite: this.configService.get('auth.cookieSameSite', 'lax'),
        path: this.configService.get<string>('auth.cookiePath', '/'),
        maxAge: maxAgeMs,
      },
    );
  }

  clearRefreshTokenCookie(response: Response): void {
    response.clearCookie(
      this.configService.get<string>('auth.refreshCookieName', 'tms_refresh_token'),
      {
        httpOnly: true,
        secure: this.configService.get<boolean>('auth.cookieSecure', false),
        sameSite: this.configService.get('auth.cookieSameSite', 'lax'),
        path: this.configService.get<string>('auth.cookiePath', '/'),
      },
    );
  }

  getRefreshTokenFromCookie(cookies: Record<string, string | undefined>): string | undefined {
    const name = this.configService.get<string>('auth.refreshCookieName', 'tms_refresh_token');
    return cookies[name];
  }

  private parseExpiresInMs(value: string): number {
    const match = /^(\d+)([smhd])$/.exec(value.trim());

    if (!match) {
      return 7 * 24 * 60 * 60 * 1000;
    }

    const amount = parseInt(match[1], 10);
    const unit = match[2];

    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return amount * (multipliers[unit] ?? multipliers.d);
  }
}
