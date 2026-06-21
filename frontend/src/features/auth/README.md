# Auth feature

## Routes

| Path | Page |
|------|------|
| `/login` | Email/password sign-in |
| `/verify-otp` | OTP completion (required when `requiresOtp`) |
| `/dashboard` | Protected shell (placeholder) |

## Session model

| Token | Storage |
|-------|---------|
| Access JWT | `sessionStorage` (`tms_access_token`) |
| Refresh | httpOnly cookie (`tms_refresh_token`) |

On load, `AuthProvider` calls `/auth/me` or `/auth/refresh`. Axios interceptor retries 401s via `/auth/refresh`.

## Hooks

- `useAuth()` — user, login, logout, `isAuthenticated`, `isLoading`
- `usePermissions()` — `hasPermission`, `hasAnyPermission`, `hasAllPermissions`

## UI gating

```tsx
import { Can } from '@/components/shared/can';
import { PERMISSIONS } from '@/constants/permissions';

<Can permission={PERMISSIONS.VIEW_REPORTS}>…</Can>
```

## Middleware

`src/middleware.ts` redirects unauthenticated users away from `/dashboard` using the refresh cookie presence.
