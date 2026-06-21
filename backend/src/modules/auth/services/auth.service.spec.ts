import { Test, TestingModule } from '@nestjs/testing';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { OtpService } from './otp.service';
import { TokenService } from './token.service';
import { RefreshTokenService } from './refresh-token.service';
import { AuditService } from '../../../common/services/audit.service';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let tokenService: jest.Mocked<TokenService>;
  let refreshTokenService: jest.Mocked<RefreshTokenService>;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    refreshToken: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    otpVerification: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
    $transaction: jest
      .fn()
      .mockImplementation((fn: (tx: any) => any) => fn(mockPrisma)),
  } as unknown as jest.Mocked<PrismaService>;

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test_value'),
    getOrThrow: jest.fn().mockReturnValue('test-secret'),
  } as unknown as jest.Mocked<ConfigService>;

  const mockTokenService = {
    getRefreshTokenFromCookie: jest.fn(),
    clearRefreshTokenCookie: jest.fn(),
    setRefreshTokenCookie: jest.fn(),
    signAccessToken: jest.fn(),
  } as unknown as jest.Mocked<TokenService>;

  const mockRefreshTokenService = {
    revoke: jest.fn(),
    revokeAllForUser: jest.fn(),
    rotate: jest.fn(),
    create: jest.fn(),
  } as unknown as jest.Mocked<RefreshTokenService>;

  const mockOtpService = {} as unknown as jest.Mocked<OtpService>;

  const mockAuditService = {
    log: jest.fn(),
  } as unknown as jest.Mocked<AuditService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: OtpService, useValue: mockOtpService },
        { provide: TokenService, useValue: mockTokenService },
        { provide: RefreshTokenService, useValue: mockRefreshTokenService },
        { provide: AuditService, useValue: mockAuditService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    tokenService = module.get(TokenService);
    refreshTokenService = module.get(RefreshTokenService);
  });

  function mockRequest(cookies: Record<string, string> = {}): Request {
    return { cookies, headers: {}, ip: '127.0.0.1' } as unknown as Request;
  }

  describe('logout', () => {
    it('should clear refresh token cookie even when no cookie exists', async () => {
      tokenService.getRefreshTokenFromCookie.mockReturnValue(undefined);

      const req = mockRequest();
      const res = {} as unknown as Response;

      await service.logout(req, res);

      expect(tokenService.clearRefreshTokenCookie).toHaveBeenCalledWith(res);
    });

    it('should revoke token and clear cookie when valid token exists', async () => {
      tokenService.getRefreshTokenFromCookie.mockReturnValue('valid-token');
      jest
        .spyOn(service as any, 'getTokenUserId')
        .mockResolvedValue({ userId: 'user-1' });

      const req = mockRequest({ tms_refresh_token: 'valid-token' });
      const res = {} as unknown as Response;

      await service.logout(req, res);

      expect(refreshTokenService.revoke).toHaveBeenCalledWith('valid-token');
      expect(tokenService.clearRefreshTokenCookie).toHaveBeenCalledWith(res);
    });

    it('should return success message', async () => {
      tokenService.getRefreshTokenFromCookie.mockReturnValue(undefined);

      const req = mockRequest();
      const res = {} as unknown as Response;

      const result = await service.logout(req, res);

      expect(result).toEqual({ message: 'Logged out successfully' });
    });

    it('should still attempt cookie clear when token revoke fails', async () => {
      tokenService.getRefreshTokenFromCookie.mockReturnValue('some-token');
      jest.spyOn(service as any, 'getTokenUserId').mockResolvedValue(undefined);
      refreshTokenService.revoke.mockRejectedValue(
        new Error('Token not found'),
      );

      const req = mockRequest({ tms_refresh_token: 'some-token' });
      const res = {} as unknown as Response;

      await expect(service.logout(req, res)).rejects.toThrow();
    });
  });

  describe('logoutAll', () => {
    it('should revoke all tokens for user and clear cookie', async () => {
      const req = mockRequest();
      const res = {} as unknown as Response;

      await service.logoutAll('user-1', req, res);

      expect(refreshTokenService.revokeAllForUser).toHaveBeenCalledWith(
        'user-1',
      );
      expect(tokenService.clearRefreshTokenCookie).toHaveBeenCalledWith(res);
    });
  });
});
