# Auth module

## Endpoints (`/api/v1/auth`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/login` | Public | Email/password; sends OTP when enabled |
| POST | `/verify-otp` | Public | Complete login with OTP session + code |
| POST | `/resend-otp` | Public | Resend OTP for pending session |
| POST | `/refresh` | Cookie | Rotate refresh token; new access token |
| POST | `/logout` | Bearer | Revoke refresh cookie |
| POST | `/logout-all` | Bearer | Revoke all refresh tokens for user |
| GET | `/me` | Bearer | Current user profile + permissions |

## Login flow

1. `POST /login` with `{ email, password }`
2. If `requiresOtp: true` → check server logs for OTP in dev → `POST /verify-otp` with `{ otpSessionId, code }`
3. Response includes `accessToken`; refresh token is set as **httpOnly** cookie only

## Authorization

- Global `JwtAuthGuard` — skip with `@Public()` from `common/decorators/public.decorator`
- Global `PermissionsGuard` — require keys with `@RequirePermissions('CREATE_TRIP')`

```typescript
import { RequirePermissions, CurrentUser } from '../auth';

@RequirePermissions('VIEW_USERS')
@Get()
findAll() {}
```

## Default dev user (after seed)

- Email: `admin@tms.local`
- Password: `Admin@123456` (override via `SEED_ADMIN_PASSWORD`)
