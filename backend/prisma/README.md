# Prisma — Auth & authorization schema

Foundation models: `User`, `Role`, `Permission`, `RolePermission`, `OtpVerification`, `AuditLog`.

Domain models (trips, vehicles, drivers) are added in later migrations.

---

## 1. Relationship overview

```mermaid
erDiagram
  Role ||--o{ User : has
  Role ||--o{ RolePermission : grants
  Permission ||--o{ RolePermission : included_in
  User ||--o{ OtpVerification : requests
  User ||--o{ AuditLog : performs

  Role {
    uuid id PK
    string name UK
  }

  Permission {
    uuid id PK
    string key UK
  }

  RolePermission {
    uuid role_id PK_FK
    uuid permission_id PK_FK
  }

  User {
    uuid id PK
    uuid role_id FK
    datetime deleted_at
  }

  OtpVerification {
    uuid id PK
    uuid user_id FK
  }

  AuditLog {
    uuid id PK
    uuid user_id FK_nullable
  }
```

| From | To | Cardinality | Notes |
|------|-----|-------------|--------|
| **Role** → **User** | 1:N | Each user has exactly one role (`role_id`). `onDelete: Restrict` prevents deleting roles that still have users. |
| **Role** ↔ **Permission** | M:N | Via `role_permissions` composite PK `(role_id, permission_id)`. Cascade delete when role or permission row is removed. |
| **User** → **OtpVerification** | 1:N | Login OTP records; cascade when user is hard-deleted (soft-deleted users retain history). |
| **User** → **AuditLog** | 1:N | `user_id` optional (`SetNull` if user removed) for system or pre-auth events. |

---

## 2. Migration strategy

### Initial migration (this phase)

```bash
# From repo root — requires PostgreSQL and DATABASE_URL in backend/.env
npm run db:generate
npm run db:migrate -w backend
# Migration name when prompted: init_auth_rbac
```

Or explicitly:

```bash
cd backend
npx prisma migrate dev --name init_auth_rbac
```

This creates `prisma/migrations/<timestamp>_init_auth_rbac/migration.sql` and applies it.

### Ongoing conventions

| Practice | Detail |
|----------|--------|
| **One concern per migration** | e.g. `add_trips_module`, not mixed with auth changes |
| **Never edit applied migrations** | Add a new migration to fix schema drift |
| **Production** | `npx prisma migrate deploy` in CI/CD after backup |
| **Review** | Check generated SQL for indexes and FK behavior before deploy |

### Recommended partial unique index (post-migration SQL)

`users.email` is unique in Prisma; for soft-delete you may want only *active* emails unique:

```sql
CREATE UNIQUE INDEX IF NOT EXISTS users_email_active_key
  ON users (email)
  WHERE deleted_at IS NULL;
```

Add via a follow-up migration when the auth module enforces re-registration rules.

### Rollback

Prisma has no automatic down migrations. Roll back by:

1. Restoring a DB snapshot, or  
2. Creating a manual “revert” migration.

---

## 3. Seed strategy (roles & permissions)

### What gets seeded

| Artifact | Source |
|----------|--------|
| **Permissions** | `prisma/seed-data.ts` — auth keys + reserved domain keys for future modules |
| **Roles** | `admin`, `dispatcher`, `manager`, `viewer` |
| **Role ↔ permission** | `ROLE_PERMISSION_MATRIX` in `seed-data.ts` |

**Not seeded here:** users, OTP rows, audit rows (created at runtime by the auth module).

### Commands

```bash
# After migrate
npm run db:seed -w backend

# Or from backend/
npx prisma db seed
```

### Idempotency

Seed uses `upsert` on roles/permissions (by `name` / `key`) and rebuilds `role_permissions` per role so re-running is safe in dev.

### Permission design notes

- **`DELETE_TRIP`** — assigned only to `admin` (business rule: only admins delete trips).
- **Domain permissions** (`VIEW_TRIPS`, etc.) — seeded but unused until trip/vehicle modules exist; keeps RBAC keys aligned with `frontend/src/constants/permissions.ts`.

### Optional: bootstrap admin user

Add in a separate seed step (not run by default) once the auth service hashes passwords:

```typescript
// Example — do not commit real passwords
await prisma.user.upsert({
  where: { email: 'admin@tms.local' },
  update: {},
  create: {
    fullName: 'System Admin',
    email: 'admin@tms.local',
    passwordHash: await hash('change-me'),
    roleId: adminRoleId,
    otpEnabled: true,
  },
});
```

---

## 4. Field conventions

| Rule | Implementation |
|------|----------------|
| UUID PKs | `@db.Uuid` + `@default(uuid())` |
| snake_case in DB | `@map` / `@@map` on all models |
| Timestamps | `created_at`; `updated_at` on mutable entities |
| Soft delete | `deleted_at` on `users` only (critical entity) |
| Immutable audit | `audit_logs` — no `updated_at`, no soft delete |
| Indexes | Email, role lookups, audit filters, OTP expiry |

---

## 5. Generate client after schema changes

```bash
npm run db:generate
```

Nest `PrismaService` imports from `generated/prisma/client`.
