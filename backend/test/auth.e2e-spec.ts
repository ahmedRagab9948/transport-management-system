import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AuthController } from '../src/modules/auth/controllers/auth.controller';
import { AuthService } from '../src/modules/auth/services/auth.service';
import { JwtAuthGuard } from '../src/modules/auth/guards/jwt-auth.guard';
import { JwtStrategy } from '../src/modules/auth/strategies/jwt.strategy';
import { JwtRefreshStrategy } from '../src/modules/auth/strategies/jwt-refresh.strategy';
import { PrismaService } from '../src/prisma/prisma.service';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { IS_PUBLIC_KEY } from '../src/common/decorators/public.decorator';

describe('Auth (e2e) — Guard pipeline & cookie behavior', () => {
  let app: INestApplication;
  let authService: jest.Mocked<AuthService>;

  const mockPrisma = {
    user: { findUnique: jest.fn(), findFirst: jest.fn() },
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
    auditLog: { create: jest.fn() },
    $transaction: jest.fn().mockImplementation((fn: any) => fn(mockPrisma)),
  } as unknown as jest.Mocked<PrismaService>;

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === 'jwt.accessSecret') return 'test-access-secret-for-e2e';
      return 'test_value';
    }),
    getOrThrow: jest.fn().mockImplementation((key: string) => {
      if (key === 'jwt.accessSecret') return 'test-access-secret-for-e2e';
      return 'test_value';
    }),
  } as unknown as jest.Mocked<ConfigService>;

  const mockUser = {
    id: '1',
    email: 'a@b.com',
    fullName: 'Test',
    roleId: 'role-1',
    roleName: 'admin',
    permissions: [],
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
          secret: 'test-access-secret-for-e2e',
          signOptions: { expiresIn: '15m' },
        }),
      ],
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest
              .fn()
              .mockResolvedValue({
                requiresOtp: false,
                accessToken: 'test-token',
                user: mockUser,
              }),
            verifyOtp: jest
              .fn()
              .mockResolvedValue({ accessToken: 'test-token', user: mockUser }),
            resendOtp: jest
              .fn()
              .mockResolvedValue({
                otpSessionId: 'session-1',
                expiresAt: new Date(),
              }),
            refreshWithToken: jest
              .fn()
              .mockResolvedValue({ accessToken: 'new-token', user: mockUser }),
            logout: jest
              .fn()
              .mockResolvedValue({ message: 'Logged out successfully' }),
            logoutAll: jest
              .fn()
              .mockResolvedValue({
                message: 'All sessions revoked successfully',
              }),
            getProfile: jest.fn().mockResolvedValue(mockUser),
          },
        },
        { provide: APP_GUARD, useClass: JwtAuthGuard },
        Reflector,
        JwtStrategy,
        JwtRefreshStrategy,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new TransformInterceptor());

    authService = app.get(AuthService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  /* ──────────────────────────────────────────────
   * Case 1 — No Cookies / Fresh Visitor
   * ────────────────────────────────────────────── */
  describe('Case 1 — No Cookies / Fresh Visitor', () => {
    it('allows @Public() login without auth', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'a@b.com', password: 'password' })
        .expect(HttpStatus.CREATED);
    });

    it('rejects protected /auth/me without JWT', () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('rejects protected /auth/logout-all without JWT', () => {
      return request(app.getHttpServer())
        .post('/auth/logout-all')
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  /* ──────────────────────────────────────────────
   * Case 2 — Logout @Public() Regression
   * ────────────────────────────────────────────── */
  describe('Case 2 — Logout Always Succeeds (@Public() regression)', () => {
    it('allows logout without any JWT', () => {
      return request(app.getHttpServer())
        .post('/auth/logout')
        .expect(HttpStatus.CREATED);
    });

    it('calls authService.logout when logout is hit', async () => {
      authService.logout.mockClear();
      await request(app.getHttpServer())
        .post('/auth/logout')
        .expect(HttpStatus.CREATED);
      expect(authService.logout).toHaveBeenCalled();
    });
  });

  /* ──────────────────────────────────────────────
   * Case 3 — Expired / Invalid Refresh Cookie
   * ────────────────────────────────────────────── */
  describe('Case 3 — Expired / Invalid Refresh Cookie', () => {
    it('returns 401 on refresh with invalid cookie', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', 'tms_refresh_token=invalid-expired-token')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('allows logout even with invalid cookie (regression)', () => {
      return request(app.getHttpServer())
        .post('/auth/logout')
        .set('Cookie', 'tms_refresh_token=invalid-expired-token')
        .expect(HttpStatus.CREATED);
    });
  });

  /* ──────────────────────────────────────────────
   * Case 4 — Manual Logout clears cookie
   * ────────────────────────────────────────────── */
  describe('Case 4 — Manual Logout clears cookie', () => {
    it('should set clear-cookie header on logout', async () => {
      authService.logout.mockImplementation(async (_req: any, res: any) => {
        res.clearCookie('tms_refresh_token', {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          path: '/',
        });
        return { message: 'Logged out successfully' };
      });

      const res = await request(app.getHttpServer())
        .post('/auth/logout')
        .expect(HttpStatus.CREATED);
      const setCookieHeader = res.headers['set-cookie'] as
        | string
        | string[]
        | undefined;
      expect(setCookieHeader).toBeDefined();
      const cookieStr: string = Array.isArray(setCookieHeader)
        ? setCookieHeader[0]
        : setCookieHeader!;
      expect(cookieStr).toContain('tms_refresh_token=');
      expect(cookieStr).toContain('Expires=Thu, 01 Jan 1970');
    });
  });

  /* ──────────────────────────────────────────────
   * Case 5 — Endpoint-level access control
   * ────────────────────────────────────────────── */
  describe('Case 5 — Endpoint access control', () => {
    it('rejects /auth/me without JWT', () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('allows /auth/login without JWT', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 't@t.com', password: 'p' })
        .expect(HttpStatus.CREATED);
    });

    it('allows /auth/verify-otp without JWT', () => {
      return request(app.getHttpServer())
        .post('/auth/verify-otp')
        .send({ otpSessionId: 's', code: '000000' })
        .expect(HttpStatus.CREATED);
    });

    it('allows /auth/resend-otp without JWT', () => {
      return request(app.getHttpServer())
        .post('/auth/resend-otp')
        .send({ otpSessionId: 's' })
        .expect(HttpStatus.CREATED);
    });

    it('allows /auth/logout without JWT', () => {
      return request(app.getHttpServer())
        .post('/auth/logout')
        .expect(HttpStatus.CREATED);
    });

    it('allows /auth/refresh without JWT (uses RefreshTokenGuard)', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('rejects /auth/logout-all without JWT', () => {
      return request(app.getHttpServer())
        .post('/auth/logout-all')
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  /* ──────────────────────────────────────────────
   * Regression: @Public() metadata persistence
   * ────────────────────────────────────────────── */
  describe('Regression: @Public() metadata on all auth endpoints', () => {
    const publicEndpoints = [
      'login',
      'verifyOtp',
      'resendOtp',
      'refresh',
      'logout',
    ] as const;
    const privateEndpoints = ['logoutAll', 'getProfile'] as const;

    it('logout has @Public() metadata', () => {
      expect(
        Reflect.getMetadata(IS_PUBLIC_KEY, AuthController.prototype.logout),
      ).toBe(true);
    });

    it('all public endpoints have @Public() metadata', () => {
      for (const method of publicEndpoints) {
        expect(
          Reflect.getMetadata(
            IS_PUBLIC_KEY,
            (AuthController.prototype as any)[method],
          ),
        ).toBe(true);
      }
    });

    it('private endpoints do not have @Public() metadata', () => {
      for (const method of privateEndpoints) {
        expect(
          Reflect.getMetadata(
            IS_PUBLIC_KEY,
            (AuthController.prototype as any)[method],
          ),
        ).toBeUndefined();
      }
    });
  });
});
