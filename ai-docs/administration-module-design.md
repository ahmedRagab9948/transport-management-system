# Administration Module — Technical Design Document

> **Phase:** R7 — Architecture & Design (no code)
> **Status:** Draft
> **Last updated:** 2026-06-29

---

## Table of Contents

1. [Overview](#1-overview)
2. [Scope & Out of Scope](#2-scope--out-of-scope)
3. [Database — No Schema Changes Required](#3-database--no-schema-changes-required)
4. [Backend Architecture](#4-backend-architecture)
5. [Frontend Architecture](#5-frontend-architecture)
6. [API Contracts](#6-api-contracts)
7. [Permission Mapping](#7-permission-mapping)
8. [Route Structure](#8-route-structure)
9. [Component Trees](#9-component-trees)
10. [Data Flow](#10-data-flow)
11. [i18n Strategy](#11-i18n-strategy--arabic-first)
12. [Error Handling & States](#12-error-handling--states)
13. [Edge Cases Matrix](#13-edge-cases-matrix)
14. [Production-Readiness Review](#14-production-readiness-review)
15. [Implementation Phases](#15-implementation-phases)

---

## 1. Overview

The Administration Module adds two new sections to the TMS:

| Section | Description | Target Audience |
|---------|-------------|----------------|
| **Users Management** | CRUD for employee user accounts, password reset, force logout | Admin only |
| **Settings** | System-wide configuration (company info, language, notification prefs) | All authenticated users |

Both map to the existing "Administration" sidebar group (nav id: `administration`), which already contains Audit Logs, Users (with `comingSoon: true`), and Settings.

### Design Principles

- **Zero new Prisma models** for Users CRUD — the existing `User`, `Role`, `Permission`, `RolePermission` models cover all requirements. Only settings require one new model.
- **Follow existing patterns** — every module in this codebase follows the NestJS module structure (backend) and feature-folder structure (frontend). This document replicates those patterns exactly.
- **Arabic-first** — `ar.json` becomes the statically imported locale; `en.json` is lazy-loaded.
- **Roles remain DB-seeded** — no custom role creation or permission editing in v1 (deferred to post-v1).

---

## 2. Scope & Out of Scope

### In Scope — MVP (Phase 1)

| Feature | Priority |
|---------|----------|
| Users list with pagination, search, filters | P0 |
| Create user | P0 |
| Edit user (fullName, email, phone, role, isActive) | P0 |
| Soft-delete user | P0 |
| Reset user password (admin-initiated) | P0 |
| Force logout user (revoke all refresh tokens) | P1 |
| View user detail (profile summary, audit trail link) | P1 |
| Settings page — company name, language toggle | P1 |
| Arabic-first locale loading | P1 |
| Audit logging for all user mutations | P0 |

### In Scope — Enhancement (Phase 2)

| Feature | Priority |
|---------|----------|
| User avatar upload | P3 |
| Notification preferences in Settings | P2 |
| "Deactivated users" filter + reactivation | P2 |
| Bulk user invite (CSV upload) | P3 |

### Out of Scope (post-v1)

| Feature | Rationale |
|---------|-----------|
| Custom role creation / permission editing | Requires role-builder UI, conflict detection, re-seeding strategy |
| OIDC / SSO integration | No IdP requirement in current business rules |
| User groups / teams | No domain concept for grouping users |
| Two-factor enrollment (self-serve) | OTP is already system-enforced per user |
| Self-serve password change | Exists as pre-work but needs "change password" page/endpoint |

---

## 3. Database — No Schema Changes Required

### Users CRUD

The existing `User` model has all required fields:

```prisma
model User {
  id           String    @id @default(uuid())
  fullName     String
  email        String    @unique
  passwordHash String
  phone        String?
  roleId       String
  isActive     Boolean   @default(true)
  otpEnabled   Boolean   @default(true)
  lastLoginAt  DateTime?
  createdAt    DateTime
  updatedAt    DateTime
  deletedAt    DateTime?   // soft delete
}
```

**What we use as-is:**
- All listed fields for CRUD display/editing
- `deletedAt` for soft-delete (list queries must filter `deletedAt: null`)
- `roleId` for role assignment (via dropdown from `Role` table)
- `isActive` for account status toggle

**What we DO NOT need to add for v1:**
- `avatar` column (Phase 2)
- `companyId` column (only one company in v1, stored in Settings)

### Settings — One New Model

Settings requires a persistent store. Since there is only one company in v1, a singleton approach is simplest:

```prisma
model SystemSetting {
  id        String   @id @default(uuid()) @db.Uuid
  key       String   @unique @db.VarChar(100)
  value     Json     @db.Json
  updatedAt DateTime @updatedAt @map("updated_at")
  updatedBy String?  @map("updated_by") @db.Uuid

  @@map("system_settings")
}
```

**Design rationale:**
- JSON value column supports heterogeneous types (string for company name, object for notification prefs, etc.)
- Key-value pattern avoids schema migrations for new settings
- `updatedBy` tracks who changed what (for audit trail)
- No `createdAt` needed since settings are upserted, not created

**Alternative considered:** A single-row table with columns per setting. Rejected because it requires a migration for every new setting.

### Prisma Migration

```bash
npx prisma migrate dev --name add_system_settings
```

---

## 4. Backend Architecture

### Module Structure

```
backend/src/modules/
├── users/                          # NEW
│   ├── users.module.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── dto/
│   │   ├── create-user.dto.ts
│   │   ├── update-user.dto.ts
│   │   ├── users-query.dto.ts
│   │   └── reset-password.dto.ts
│   ├── interfaces/
│   │   └── users-response.interface.ts
│   └── enums/
│       └── users-audit-action.enum.ts
├── settings/                       # NEW
│   ├── settings.module.ts
│   ├── settings.controller.ts
│   ├── settings.service.ts
│   ├── dto/
│   │   └── update-settings.dto.ts
│   └── enums/
│       └── settings-audit-action.enum.ts
└── auth/                           # EXISTING — add reset-password endpoint
```

### Auth Module Additions

The existing `auth.module.ts` and `auth.controller.ts` get one new endpoint:

```
POST /api/v1/auth/reset-password ── Admin-initiated password reset
```

This goes in auth because:
- It reuses `AuthService.hashPassword()`, `TokenService`, and `RefreshTokenService`
- Password hashing and token revocation are auth concerns
- Keeps users module focused on CRUD + role management

### Users Module Design

#### users.module.ts

```typescript
@Module({
  imports: [PrismaModule, forwardRef(() => AuthModule)],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

**Why `forwardRef(() => AuthModule)`:**
- `UsersService` needs `AuthService.hashPassword()` and `RefreshTokenService.revokeAllForUser()`
- `AuthService` does not depend on `UsersModule`, so forward ref is safe

#### users.controller.ts

| Method | Path | Permission | Purpose |
|--------|------|------------|---------|
| GET | `/users` | `VIEW_USERS` | Paginated list with search/filters |
| GET | `/users/:id` | `VIEW_USERS` | Single user detail |
| POST | `/users` | `CREATE_USER` | Create employee account |
| PATCH | `/users/:id` | `UPDATE_USER` | Update user fields |
| DELETE | `/users/:id` | `DELETE_USER` | Soft-delete user |
| POST | `/users/:id/reset-password` | `UPDATE_USER` | Admin-initiated password reset |
| POST | `/users/:id/force-logout` | `UPDATE_USER` | Revoke all refresh tokens |

**Guards:**
- Controller-level: `@UseGuards(JwtAuthGuard, PermissionsGuard)` (follows existing pattern)
- Method-level: `@RequirePermissions(PERMISSIONS.VIEW_USERS)` etc.

#### users.service.ts — Key Logic

- **List:** Prisma query with `where: { deletedAt: null }`, optional search across name/email/phone, optional `isActive` filter, `roleId` filter, paginated with `skip`/`take`
- **Create:** `bcrypt.hash()` password, `prisma.user.create()` with the hashed password, return user without `passwordHash`
- **Update:** `prisma.user.update()` with explicit allowed fields, log old/new values via `AuditService`
- **Delete (soft):** `prisma.user.update({ data: { deletedAt: new Date(), isActive: false } })`, revoke all refresh tokens (deactivated user cannot log in)
- **Reset password:** Generate random 16-char password, hash it, update user, return the temp password to the admin (they must share it with the user — same as current OTP flow)
- **Force logout:** Call `RefreshTokenService.revokeAllForUser()`

**Critical detail:** The `GET /users` endpoint must NOT return `passwordHash`. Use Prisma `select` instead of `include`:

```typescript
private userSelect = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
  roleId: true,
  isActive: true,
  otpEnabled: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
  role: { select: { id: true, name: true } },
};
```

#### Audit Actions

```typescript
export const USERS_AUDIT_ACTIONS = {
  CREATE_USER: 'CREATE_USER',
  UPDATE_USER: 'UPDATE_USER',
  DEACTIVATE_USER: 'DEACTIVATE_USER',
  REACTIVATE_USER: 'REACTIVATE_USER',
  RESET_PASSWORD: 'RESET_PASSWORD',
  FORCE_LOGOUT: 'FORCE_LOGOUT',
} as const;
```

These log the actor (authenticated user), action, entity type (`'User'`), and old/new values for update operations.

### Settings Module Design

#### settings.controller.ts

| Method | Path | Permission | Purpose |
|--------|------|------------|---------|
| GET | `/settings` | None (authenticated) | Get all settings (key-value map) |
| PATCH | `/settings` | None (authenticated) | Update settings (upsert by key) |

**Why no permission guard:** Settings are not sensitive. All authenticated users can view/update. If business rules change, add a `MANAGE_SETTINGS` permission.

#### settings.service.ts — Key Logic

- **Get:** Fetch all rows from `systemSettings`, return as `Record<string, any>` (key → value)
- **Update:** Accept `Record<string, any>`, for each key do `prisma.systemSetting.upsert({ where: { key }, create: { key, value, updatedBy }, update: { value, updatedBy } })`

**Allowed keys (validate in DTO):**

```typescript
const ALLOWED_SETTING_KEYS = ['companyName', 'language', 'notifications'] as const;
```

---

## 5. Frontend Architecture

### Directory Structure

```
frontend/src/
├── features/
│   ├── users/                             # NEW
│   │   ├── index.ts                       # public barrel
│   │   ├── pages/                         # route-level components
│   │   │   ├── users-page.tsx             # list page
│   │   │   └── user-detail-page.tsx       # detail/edit page
│   │   ├── components/                    # UI components
│   │   │   ├── users-table.tsx            # TanStack Table with actions
│   │   │   ├── users-table-filters.tsx    # search + filter bar
│   │   │   ├── create-user-dialog.tsx     # modal form via FormCard
│   │   │   ├── edit-user-dialog.tsx       # modal form via FormCard
│   │   │   ├── user-detail-card.tsx       # profile summary card
│   │   │   ├── reset-password-dialog.tsx  # confirm + show temp password
│   │   │   └── delete-user-dialog.tsx     # confirm soft-delete
│   │   ├── hooks/
│   │   │   ├── use-users.ts              # useQuery + useMutation hooks
│   │   │   └── use-user.ts              # single user query
│   │   ├── services/
│   │   │   └── users.service.ts          # API client methods
│   │   ├── schemas/
│   │   │   └── user.schema.ts            # Zod schemas for forms
│   │   └── types/
│   │       └── user.types.ts             # TypeScript interfaces
│   └── settings/                          # NEW
│       ├── index.ts
│       ├── pages/
│       │   └── settings-page.tsx
│       ├── components/
│       │   ├── company-info-section.tsx
│       │   ├── language-section.tsx
│       │   └── notification-section.tsx
│       ├── hooks/
│       │   └── use-settings.ts
│       ├── services/
│       │   └── settings.service.ts
│       ├── schemas/
│       │   └── settings.schema.ts
│       └── types/
│           └── settings.types.ts
├── components/
│   └── shared/                            # EXISTING — reused as-is
│       └── ... (DataTableWrapper, PageHeader, FormCard, etc.)
├── lib/
│   └── i18n/
│       └── locale-context.tsx             # EXISTING — modify for Arabic-first
└── constants/
    ├── routes.ts                          # EXISTING — already has /users, /settings
    └── navigation.ts                      # EXISTING — set comingSoon: false
```

### Feature Pattern (matches existing `features/trips/`)

```
features/{feature}/
├── index.ts              → re-exports pages, hooks
├── pages/                → page-level components (registered in router)
├── components/           → reusable UI pieces
├── hooks/                → React Query hooks (use-{resource}.ts)
├── services/             → API client wrapper
├── schemas/              → Zod schemas
└── types/                → TypeScript interfaces
```

### Key Frontend Decisions

- **Users are displayed in a modal create/edit dialog**, not a separate page, because the user object is small and the list should remain the primary view. Detail is on a separate page (`/users/:id`).
- **Settings is a single page** with sections (Company Info, Language, Notification Preferences) stacked vertically using existing `FormCard` components. No sub-navigation needed.
- **TanStack Table** with `DataTableWrapper` for the users list, same as trips/vehicles/etc.
- **Arabic-first language toggle** lives in Settings (and also persists globally via header toggle if we add one later).

---

## 6. API Contracts

### Users

#### `GET /api/v1/users`

**Query params:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | 1-indexed |
| `limit` | number | 20 | Max `MAX_PAGE_SIZE` (100) |
| `search` | string? | — | Search fullName, email, phone |
| `roleId` | string (uuid)? | — | Filter by role |
| `isActive` | boolean? | — | Filter by active status |
| `sortBy` | string? | `createdAt` | Field to sort by |
| `sortOrder` | `asc` \| `desc`? | `desc` | Sort direction |

**Response:**
```json
{
  "data": {
    "items": [
      {
        "id": "uuid",
        "fullName": "Ahmed Ragab",
        "email": "ahmed@tms.local",
        "phone": "+201234567890",
        "role": { "id": "uuid", "name": "admin" },
        "isActive": true,
        "otpEnabled": true,
        "lastLoginAt": "2026-06-28T10:00:00Z",
        "createdAt": "2026-01-15T08:00:00Z"
      }
    ],
    "total": 42,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  },
  "meta": { "timestamp": "..." }
}
```

#### `GET /api/v1/users/:id`

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "fullName": "Ahmed Ragab",
    "email": "ahmed@tms.local",
    "phone": "+201234567890",
    "role": { "id": "uuid", "name": "admin" },
    "isActive": true,
    "otpEnabled": true,
    "lastLoginAt": "2026-06-28T10:00:00Z",
    "createdAt": "2026-01-15T08:00:00Z"
  }
}
```

#### `POST /api/v1/users`

**Request body:**
```json
{
  "fullName": "New User",
  "email": "new@tms.local",
  "password": "Temp@123456",
  "phone": "+201234567890",
  "roleId": "uuid",
  "isActive": true,
  "otpEnabled": true
}
```

**Validation rules (Zod/NestJS `ValidationPipe`):**
- `fullName`: 1–255 chars, non-empty
- `email`: valid email format, unique in DB (checked by service)
- `password`: 8–128 chars, at least 1 uppercase, 1 lowercase, 1 digit, 1 special char (mirrors current `password` validation in auth)
- `phone`: optional, valid Egyptian phone (`^\+?20\d{10}$`) or any international format
- `roleId`: must reference existing role in DB

**Response:** `201 Created` with the created user object (same shape as GET).

#### `PATCH /api/v1/users/:id`

**Request body (partial):**
```json
{
  "fullName": "Updated Name",
  "email": "updated@tms.local",
  "phone": "+201098765432",
  "roleId": "uuid",
  "isActive": true,
  "otpEnabled": false
}
```

**Validation rules:**
- At least one field required
- `email` uniqueness check (exclude current user)

**Response:** Updated user object.

#### `DELETE /api/v1/users/:id`

**Response:** `200 OK`
```json
{ "message": "User deactivated successfully" }
```

**Side effects:**
- Sets `deletedAt` to now, `isActive` to false
- Revokes all refresh tokens for the user
- Logs `DEACTIVATE_USER` audit event

#### `POST /api/v1/users/:id/reset-password`

**Request body:** (empty, or optionally `{}`)

**Response:** `200 OK`
```json
{
  "message": "Password reset successfully",
  "temporaryPassword": "Xk9mPq2!rT8vLm4#"
}
```

**Side effects:**
- Generates a temporary 16-char password
- Hashes and persists it
- Revokes all refresh tokens (forces re-login)
- Logs `RESET_PASSWORD` audit event

**Security note:** The temporary password is returned to the admin. There is no mechanism for the user to set their own password after forced reset — this mirrors the current system where only admins manage accounts. If self-serve password change is added later, a `POST /api/v1/auth/change-password` endpoint should be added.

#### `POST /api/v1/users/:id/force-logout`

**Request body:** (empty)

**Response:** `200 OK`
```json
{ "message": "All sessions revoked for user" }
```

**Side effects:**
- Calls `RefreshTokenService.revokeAllForUser(userId)`
- Logs `FORCE_LOGOUT` audit event

### Settings

#### `GET /api/v1/settings`

**Response:**
```json
{
  "data": {
    "companyName": "TMS Logistics Co.",
    "language": "ar",
    "notifications": {
      "email": true,
      "inApp": true
    }
  }
}
```

#### `PATCH /api/v1/settings`

**Request body:**
```json
{
  "companyName": "New Company Name",
  "language": "en"
}
```

**Validation:**
- `companyName`: string, 1–255 chars
- `language`: enum `'en' | 'ar'`
- `notifications`: optional object with `{ email: boolean, inApp: boolean }`
- Unrecognized keys are silently ignored

**Response:** Updated settings object.

---

## 7. Permission Mapping

| Frontend Component | Permission Required | Backend Endpoint |
|---|---|---|
| Users list page | `VIEW_USERS` | `GET /users` |
| User detail page | `VIEW_USERS` | `GET /users/:id` |
| Create user button/dialog | `CREATE_USER` | `POST /users` |
| Edit user button/dialog | `UPDATE_USER` | `PATCH /users/:id` |
| Delete user button/dialog | `DELETE_USER` | `DELETE /users/:id` |
| Reset password button/dialog | `UPDATE_USER` | `POST /users/:id/reset-password` |
| Force logout button | `UPDATE_USER` | `POST /users/:id/force-logout` |
| Settings page | None (authenticated) | `GET /settings`, `PATCH /settings` |

**Frontend permission enforcement:**
- `Users list` page: guarded by `withPermission(Can.view(...))` via existing `usePermissions` hook
- Action buttons (create/edit/delete): conditionally rendered based on user's permission set
- "No permission" empty state shown when user lacks `VIEW_USERS`

---

## 8. Route Structure

### Backend Routes

```
POST   /api/v1/auth/reset-password        (add to existing auth controller)
GET    /api/v1/users                       (new users module)
GET    /api/v1/users/:id                   (new users module)
POST   /api/v1/users                       (new users module)
PATCH  /api/v1/users/:id                   (new users module)
DELETE /api/v1/users/:id                   (new users module)
POST   /api/v1/users/:id/reset-password    (new users module)
POST   /api/v1/users/:id/force-logout      (new users module)
GET    /api/v1/settings                    (new settings module)
PATCH  /api/v1/settings                    (new settings module)
```

### Frontend Routes (already exist in `routes.ts`)

```typescript
ROUTES.users       // '/users'
ROUTES.settings    // '/settings'
```

### Router Registration

Add to the existing `app-router.tsx` (or wherever feature pages are registered):

```typescript
const UsersPage = lazy(() => import('@/features/users/pages/users-page'));
const UserDetailPage = lazy(() => import('@/features/users/pages/user-detail-page'));
const SettingsPage = lazy(() => import('@/features/settings/pages/settings-page'));

// In route config:
{ path: ROUTES.users, element: <ProtectedRoute permission="VIEW_USERS"><UsersPage /></ProtectedRoute> },
{ path: ROUTES.usersDetail(':id'), element: <ProtectedRoute permission="VIEW_USERS"><UserDetailPage /></ProtectedRoute> },
{ path: ROUTES.settings, element: <SettingsPage /> },
```

### Sidebar Navigation Updates

In `navigation.ts`, change only **one field**:

```typescript
{
  id: 'users',
  label: 'Users',
  href: ROUTES.users,
  icon: Users,
  permission: PERMISSIONS.VIEW_USERS,
  comingSoon: false,  // ← was true
},
```

---

## 9. Component Trees

### Users List Page (`/users`)

```
UsersPage
├── PageHeader (title="Users", subtitle, actions=[CreateUserButton])
├── UsersTableFilters (search input, role dropdown, active toggle)
├── DataTableWrapper
│   └── UsersTable (TanStack Table columns, row actions)
│       ├── Column: Full Name (sortable)
│       ├── Column: Email
│       ├── Column: Phone
│       ├── Column: Role (badge)
│       ├── Column: Status (isActive toggle badge)
│       ├── Column: Last Login (relative time)
│       ├── Column: Actions dropdown
│       │   ├── View Profile → /users/:id
│       │   ├── Edit → opens EditUserDialog
│       │   ├── Reset Password → opens ResetPasswordDialog
│       │   ├── Force Logout → opens ForceLogoutDialog
│       │   └── Deactivate → opens DeleteUserDialog
│       └── Empty state: "No users found" illustration
└── CreateUserDialog (modal)
    ├── FormCard
    │   ├── TextField: fullName
    │   ├── TextField: email
    │   ├── PasswordField: password (with generator hint)
    │   ├── TextField: phone
    │   ├── SelectField: role (fetched from /roles endpoint)
    │   ├── SwitchField: isActive
    │   └── SwitchField: otpEnabled
    └── Footer: [Cancel] [Create]
```

### User Detail Page (`/users/:id`)

```
UserDetailPage
├── PageHeader (title=user.fullName, breadcrumb=Users)
├── UserDetailCard
│   ├── Avatar (placeholder icon, Phase 2: real avatar)
│   ├── Full Name
│   ├── Email
│   ├── Phone
│   ├── Role (badge)
│   ├── Status badge (Active / Inactive)
│   ├── OTP Enabled badge
│   ├── Last Login
│   ├── Created At
│   └── Actions: [Edit] [Reset Password] [Force Logout] [Deactivate]
├── Recent Activity (Phase 2: link to audit logs filtered by this user)
```

### Settings Page (`/settings`)

```
SettingsPage
├── PageHeader (title="Settings")
├── CompanyInfoSection
│   └── FormCard
│       └── TextField: companyName
├── LanguageSection
│   └── FormCard
│       └── RadioGroup: language (en / ar)
└── NotificationSection (Phase 2)
    └── FormCard
        ├── SwitchField: email notifications
        └── SwitchField: in-app notifications
```

---

## 10. Data Flow

### Users List (typical read path)

```
UsersPage mount
  → useUsers(queryParams) hook
    → useQuery({ queryKey: QUERY_KEYS.USERS, queryFn: () => usersService.getUsers(params) })
      → usersService.getUsers(params)
        → apiClient.get('/users', { params: cleanParams(params) })
          → NestJS UsersController.findAll(queryDto)
            → UsersService.findAll(queryDto)
              → prisma.user.findMany({ where: { deletedAt: null, ...filters }, include: { role }, skip, take })
                → PostgreSQL
              ← { items, total, page, limit, totalPages }
            ← { data: ..., meta: ... }
          ← axios response
        ← unwrapApiResponse
      ← PaginatedUsersResponse
    ← { data, isLoading, isError, error }
  → render UsersTable with data
```

### Create User (typical write path)

```
CreateUserDialog submit
  → useCreateUser mutation hook
    → usersService.createUser(payload)
      → apiClient.post('/users', payload)
        → NestJS UsersController.create(dto)
          → validate DTO (Zod + NestJS ValidationPipe)
          → check email uniqueness
          → hash password (bcrypt, 12 rounds)
          → prisma.user.create({ data })
          → auditService.log({ action: 'CREATE_USER', ... })
          ← created user
        ← 201 + user data
      ← unwrapApiResponse
    ← onSuccess: invalidate QUERY_KEYS.USERS, close dialog, toast success
  → if error: show inline error in dialog
```

### Password Reset (sensitive write path)

```
ResetPasswordDialog submit
  → useResetPassword mutation
    → usersService.resetPassword(userId)
      → apiClient.post(`/users/${userId}/reset-password`)
        → NestJS UsersController.resetPassword(userId)
          → user exists? (not deleted)
          → generateTemporaryPassword() (16 chars, crypto.randomBytes)
          → hashPassword(tempPassword)
          → prisma.user.update({ where: { id: userId }, data: { passwordHash } })
          → refreshTokenService.revokeAllForUser(userId)  // forces re-login
          → auditService.log({ action: 'RESET_PASSWORD', ... })
          ← { temporaryPassword: '...' }
        ← 200 + temp password
      ← unwrapApiResponse
    ← onSuccess: show dialog with temporary password (copy button), toast
```

### Language change flow

```
SettingsPage → LanguageSection
  → RadioGroup: language = 'ar'
    → useUpdateSettings mutation
      → settingsService.updateSettings({ language: 'ar' })
        → PATCH /api/v1/settings
        → backend persists language in system_settings
      → onSuccess:
        1. Call localeContext.setLocale('ar')
           → _setLocale writes localStorage, cookie, DOM dir/lang
           → dynamic import of ar.json (but now it's static — see i18n section)
        2. Toast confirmation
        3. Page re-renders with RTL layout
```

---

## 11. i18n Strategy — Arabic-First

### Current State (from R7.2)

```typescript
// locale-context.tsx (current)
import en from '@/messages/en.json';     // static import
// ar.json loaded dynamically when locale === 'ar'
```

This means `en.json` (~45 KB) is always bundled; `ar.json` (~52 KB) is lazy-loaded.

### Target State (Arabic-first)

```typescript
// locale-context.tsx (after change)
import ar from '@/messages/ar.json';     // static import (default locale)
// en.json loaded dynamically when locale === 'en'
```

### Changes Required

1. **Swap the static import** — `ar.json` becomes the static import; `en.json` becomes dynamically imported.
2. **Update the `_locale` initial value** — change from `'en'` to `'ar'`.
3. **Update `LocaleProvider` initialLocale default** — change from `'en'` to `'ar'`.
4. **Update the locale resolution logic** — the `useLayoutEffect` that reads from `localStorage` should default to `'ar'` if no stored preference exists.
5. **Update `applyLocaleToDOM` default** — initial HTML `dir` should be `'rtl'` if server-rendered.

### Why This Works

- The application is primarily used by Arabic-speaking dispatchers and managers.
- The `_t()` function (module-level, outside React) uses `messages[_locale]` and falls back to `en` — so when `ar` is statically imported, all labels render immediately.
- `en.json` loaded via dynamic `import('@/messages/en.json')` in the same pattern as the current `ar.json` loading.
- No changes needed to any component — `t()` and `_t()` work identically regardless of which locale is static.

---

## 12. Error Handling & States

### Loading States

| Component | Loading Indicator |
|-----------|------------------|
| Users list (initial) | Skeleton rows in DataTableWrapper (existing pattern) |
| User detail page | Full-page skeleton (existing DetailsLayout pattern) |
| Create/Edit dialog submit | Submit button shows spinner + disabled |
| Settings page | Skeleton cards |
| Password reset submit | Button shows spinner + "Resetting..." text |

### Empty States

| Scenario | Display |
|----------|---------|
| No users in system | "No users found. Create your first user to get started." + Create button |
| Search returns no results | "No users match your search. Try different filters." |
| No settings loaded | "Settings unavailable" (should not happen — settings are populated on first PATCH) |

### Error States

| Scenario | Handling |
|----------|----------|
| Network error on list load | Inline error banner: "Unable to load users. [Retry]" |
| Network error on mutation | Toast: "Failed to create user. Please try again." |
| Email already exists | Field-level error: "A user with this email already exists." (caught by Prisma unique constraint → mapped in service) |
| Role not found on create | Field-level error: "Selected role does not exist." |
| User not found (detail page) | 404 page (existing NotFoundComponent) |
| Attempt to self-deactivate | Backend rejects: `Cannot deactivate your own account` |
| Attempt to self-reset-password | Backend rejects: `Cannot reset your own password — use your profile settings` |
| Concurrent edit conflict | Last-write-wins (no optimistic locking in v1 — acceptable for low-contention admin module) |

### Toast Notifications

| Action | Success Toast | Error Toast |
|--------|---------------|-------------|
| Create user | "User created successfully" | "Failed to create user" |
| Update user | "User updated successfully" | "Failed to update user" |
| Delete user | "User deactivated successfully" | "Failed to deactivate user" |
| Reset password | "Password reset successfully" | "Failed to reset password" |
| Force logout | "All sessions revoked" | "Failed to revoke sessions" |
| Update settings | "Settings saved" | "Failed to save settings" |

---

## 13. Edge Cases Matrix

| # | Edge Case | Handling | Where |
|---|-----------|----------|-------|
| 1 | Admin deactivates themselves | Backend rejects with 400; frontend disables Deactivate on own row | Controller validation |
| 2 | Admin resets their own password | Backend rejects with 400; frontend hides Reset Password on own row | Controller validation + frontend conditional render |
| 3 | Email uniqueness violation on update (email unchanged) | Query by email + exclude current ID; if found, reject | Service |
| 4 | Soft-deleted user re-created with same email | `deletedAt` is unique-constrained? No — email is unique, but deleted user still occupies email. Option A: allow re-creation with different email. Option B: reactivate deleted user. **Decision: Option A in v1** — admin must use a new email. Reactivation is Phase 2. | Service |
| 5 | Role deleted while users still assigned | `onDelete: Restrict` in Prisma — prevents deletion. Backend returns 409 Conflict. | Prisma schema (existing) |
| 6 | Password reset for non-existent user | 404 Not Found | Controller |
| 7 | Force logout for already-logged-out user | No-op — `revokeAllForUser` updates 0 rows, returns success | Service |
| 8 | Two admins edit same user simultaneously | Last-write-wins. Acceptable — audit trail captures both changes. Phase 2: version column + optimistic locking. | — |
| 9 | Settings PATCH with empty body | 400 Bad Request: `At least one setting must be provided` | Request validation |
| 10 | Create user with weak password | Zod schema enforces password strength rules (same as auth) | Schema |
| 11 | Users page with `page` beyond total pages | Return empty `items` array with correct `total` and `page` | Service |
| 12 | Language set to Arabic, then locale data cleared (localStorage) | Defaults to `ar` (Arabic-first default) | Locale context |
| 13 | Large user list (10,000+) | Pagination at 20/page with MAX_PAGE_SIZE=100. Index on `created_at`, `deleted_at`, `is_active` already exist in Prisma schema. | DB indexes (existing) |
| 14 | Phone number in different formats | Store as-is, no normalization. Search uses ILIKE/`contains` on raw string. | Service |
| 15 | Deactivated user attempts to login | Auth service already checks `isActive` and `deletedAt` — returns `UnauthorizedException` | Auth service (existing) |

---

## 14. Production-Readiness Review

### Risks & Mitigations

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|------------|--------|------------|
| R1 | Accidental mass user deletion | Low | Critical | Soft-delete only; audit logged; admin cannot deactivate self |
| R2 | Password reset temp password intercepted | Low | High | Returned only once in response; admin expected to share out-of-band; HTTPS enforced |
| R3 | Concurrent settings overwrite | Low | Low | Last-write-wins is acceptable for settings |
| R4 | Users module missing proper pagination under high load | Low | Medium | Indexed queries; pagination capped at `MAX_PAGE_SIZE`; no expensive joins |
| R5 | RTL layout issues with new components | Medium | Medium | All new components use existing shadcn/ui primitives which support RTL via Tailwind `rtl:` modifiers |
| R6 | Arabic translation gaps in new UI strings | Medium | Medium | `_t()` falls back to `en` keys; missing Arabic strings show English text instead of broken UI |

### Security Checklist

| Check | Status | Notes |
|-------|--------|-------|
| All admin endpoints require authentication | ✅ | `JwtAuthGuard` is global |
| Permission check on every admin mutation | ✅ | `@RequirePermissions()` decorator |
| Password never returned in list/detail response | ✅ | `select` excludes `passwordHash` |
| Passwords hashed with bcrypt (12 rounds) | ✅ | Uses existing `AuthService.hashPassword()` |
| Soft-delete preserves referential integrity | ✅ | Uses `deletedAt` pattern already in codebase |
| Rate limiting on password reset | ⚠️ | Not yet implemented globally — should be added to auth module |
| Audit trail for all sensitive operations | ✅ | All CRUD + reset/force-logout logged via `AuditService` |
| No sensitive data in URL params | ✅ | All IDs are UUIDs; no PII in query strings |
| SQL injection prevention | ✅ | Prisma parameterized queries |

### Performance Checklist

| Check | Status | Notes |
|-------|--------|-------|
| Paginated list endpoint | ✅ | Page/limit/skip pattern matching all existing endpoints |
| DB indexes on filtered columns | ✅ | `createdAt`, `deletedAt`, `isActive`, `roleId` already indexed |
| React Query caching with `keepPreviousData` | ✅ | Follows R7.2 optimization pattern |
| Lazy-loaded page components | ✅ | Uses existing `React.lazy()` + `Suspense` pattern |
| No N+1 queries | ✅ | Users list includes role in a single `include` query |
| Bundle size impact | Low | Users module: ~5 KB gzipped (Table, Forms, dialogs). Settings: ~3 KB. Both load lazily. |

### Accessibility Checklist (Arabic-first considerations)

| Check | Notes |
|-------|-------|
| All labels use `t()` function | Arabic translations in `ar.json` |
| `dir="rtl"` set on `<html>` | Handled by `locale-context.tsx` |
| Form error messages respect RTL | shadcn `FormMessage` reads `dir` from parent |
| Table columns reorder logically for RTL | TanStack Table handles RTL natively |
| Keyboard navigation works in RTL | All shadcn primitives tested for RTL |

---

## 15. Implementation Phases

### Phase 1 — Core (estimated: 5–6 days)

| Step | Task | Est. | Dependencies |
|------|------|------|-------------|
| 1 | Generate Prisma migration for `system_settings` table | 0.5h | — |
| 2 | Create `backend/src/modules/users/` — module, controller, service, DTOs, audit enums | 2d | Step 1 |
| 3 | Implement Users CRUD (list, get, create, update, soft-delete) | 1.5d | Step 2 |
| 4 | Implement reset-password (in auth controller) + force-logout endpoints | 0.5d | Step 3 |
| 5 | Create `backend/src/modules/settings/` — module, controller, service, DTOs | 0.5d | Step 1 |
| 6 | Create `frontend/src/features/users/` — types, service, schemas, hooks | 1d | Steps 3-4 |
| 7 | Create users list page + table + filters + CRUD dialogs | 1.5d | Step 6 |
| 8 | Create user detail page | 0.5d | Step 6 |
| 9 | Create `frontend/src/features/settings/` — page, sections, hooks, service | 0.5d | Step 5 |
| 10 | Arabic-first i18n swap (locale-context.tsx + dynamic en.json) | 0.5d | — |
| 11 | Update navigation (set `comingSoon: false`) + register routes | 0.5d | Steps 7-8 |
| **Total** | | **~5.5d** | |

### Phase 2 — Enhancement (estimated: 2–3 days)

| Step | Task | Est. |
|------|------|------|
| 1 | Deactivated users filter + reactivation endpoint | 0.5d |
| 2 | Notification preferences in Settings | 1d |
| 3 | "Recent Activity" section on User Detail page | 0.5d |
| 4 | User avatar upload (S3/MinIO) | 1d |
| **Total** | | **~3d** |

### Phase 3 — Post-v1

| Task | Rationale |
|------|-----------|
| Custom role builder | Complex UI with permission tree |
| Bulk user invite (CSV) | Low usage frequency |
| Self-serve password change | Requires new auth endpoint + profile page |
| Optimistic concurrency (version column) | Low contention on admin pages |

---

## Appendix A: Files That Must Change

| File | Change Type | What |
|------|-------------|------|
| `backend/prisma/schema.prisma` | Add model | `SystemSetting` model |
| `backend/prisma/seed-data.ts` | Add key | `MANAGE_SETTINGS` permission key (if we decide to guard settings) |
| `backend/src/app.module.ts` | Add imports | `UsersModule`, `SettingsModule` |
| `backend/src/modules/auth/auth.controller.ts` | New endpoint | `POST /reset-password` |
| `backend/src/modules/auth/auth.service.ts` | New method | `async resetPassword(userId: string): Promise<string>` |
| `backend/src/modules/auth/README.md` | Update | Add reset-password to endpoint table |
| `frontend/src/lib/i18n/locale-context.tsx` | Modify | Swap static import from `en` to `ar`, dynamic import becomes `en` |
| `frontend/src/constants/navigation.ts` | Modify | Set `comingSoon: false` on users nav item |
| `frontend/src/app-router.tsx` | Add routes | Users page, User Detail page, Settings page |

## Appendix B: Files That Must Be Created

| File | Purpose |
|------|---------|
| `backend/src/modules/users/users.module.ts` | Module definition |
| `backend/src/modules/users/users.controller.ts` | REST controller with 7 endpoints |
| `backend/src/modules/users/users.service.ts` | Business logic |
| `backend/src/modules/users/dto/create-user.dto.ts` | Create validation |
| `backend/src/modules/users/dto/update-user.dto.ts` | Update validation |
| `backend/src/modules/users/dto/users-query.dto.ts` | List query params validation |
| `backend/src/modules/users/dto/reset-password.dto.ts` | (empty, just for consistency) |
| `backend/src/modules/users/interfaces/users-response.interface.ts` | Response types |
| `backend/src/modules/users/enums/users-audit-action.enum.ts` | Audit action constants |
| `backend/src/modules/settings/settings.module.ts` | Module definition |
| `backend/src/modules/settings/settings.controller.ts` | REST controller |
| `backend/src/modules/settings/settings.service.ts` | Business logic |
| `backend/src/modules/settings/dto/update-settings.dto.ts` | Validation |
| `backend/src/modules/settings/enums/settings-audit-action.enum.ts` | Audit action constants |
| `frontend/src/features/users/types/user.types.ts` | TS interfaces |
| `frontend/src/features/users/schemas/user.schema.ts` | Zod schemas |
| `frontend/src/features/users/services/users.service.ts` | API client |
| `frontend/src/features/users/hooks/use-users.ts` | React Query hooks |
| `frontend/src/features/users/hooks/use-user.ts` | Single user query |
| `frontend/src/features/users/components/users-table.tsx` | TanStack Table |
| `frontend/src/features/users/components/users-table-filters.tsx` | Filter bar |
| `frontend/src/features/users/components/create-user-dialog.tsx` | Create modal |
| `frontend/src/features/users/components/edit-user-dialog.tsx` | Edit modal |
| `frontend/src/features/users/components/user-detail-card.tsx` | Profile card |
| `frontend/src/features/users/components/reset-password-dialog.tsx` | Reset modal |
| `frontend/src/features/users/components/delete-user-dialog.tsx` | Deletion confirm |
| `frontend/src/features/users/pages/users-page.tsx` | List page |
| `frontend/src/features/users/pages/user-detail-page.tsx` | Detail page |
| `frontend/src/features/users/index.ts` | Barrel export |
| `frontend/src/features/settings/types/settings.types.ts` | TS interfaces |
| `frontend/src/features/settings/schemas/settings.schema.ts` | Zod schemas |
| `frontend/src/features/settings/services/settings.service.ts` | API client |
| `frontend/src/features/settings/hooks/use-settings.ts` | React Query hooks |
| `frontend/src/features/settings/components/company-info-section.tsx` | Company section |
| `frontend/src/features/settings/components/language-section.tsx` | Language section |
| `frontend/src/features/settings/components/notification-section.tsx` | Notifications section |
| `frontend/src/features/settings/pages/settings-page.tsx` | Settings page |
| `frontend/src/features/settings/index.ts` | Barrel export |

**Total: 36 new files, 6 modified files.**
