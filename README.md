# Transport Management System (TMS)

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=nextdotjs)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?logo=nestjs)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)

A **production-grade, full-stack enterprise transportation management system** built for logistics and transportation companies. Manage vehicles, drivers, trips, clients, contracts, and employees with role-based access control, OTP authentication, and real-time tracking.

---

## Features

- **Dashboard** — Real-time KPIs, monthly trip trends, vehicle/driver status charts, recent activity feed, and system alerts
- **Trip Management** — Full CRUD, status tracking, timeline history, vehicle & driver assignment, per-trip or monthly contracts
- **Vehicle Management** — Fleet inventory, plate registration, status tracking (active, in-trip, maintenance, out-of-service)
- **Driver Management** — Driver records, license tracking, status management, assignment history
- **Client & Contract Management** — Client directory, contract lifecycle (draft, active, expired, terminated), trip linking
- **Authentication & Authorization** — Email/password login with OTP verification, JWT access + refresh token rotation, RBAC with granular permissions
- **Notifications** — In-app notification system for trip events, vehicle maintenance, driver status changes, and contract expirations
- **Audit Logging** — Immutable audit trail tracking all entity changes with who, what, and when
- **RTL Support** — Full Arabic/English localization with RTL layout support
- **Responsive Design** — Mobile-first responsive UI optimized from 320px to ultrawide

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| **Next.js 16** (App Router) | React framework with server components |
| **TypeScript** | Type safety across the entire codebase |
| **Tailwind CSS v4** | Utility-first styling with design tokens |
| **Base UI** | Headless React primitives |
| **TanStack React Query** | Server state management |
| **TanStack React Table** | Data tables with sorting, filtering, column visibility |
| **React Hook Form + Zod** | Form validation |
| **Framer Motion** | Animations |
| **Recharts** | Dashboard charts |
| **next-themes** | Dark/light mode |
| **Zustand** | Client state management |

### Backend

| Technology | Purpose |
|---|---|
| **NestJS 11** | Backend framework (modular architecture) |
| **TypeScript** | Type safety |
| **Prisma ORM** | Type-safe database access with migrations |
| **PostgreSQL** | Primary database |
| **Passport.js** | Authentication strategies (JWT, custom) |
| **Helmet** | Security headers |
| **class-validator / class-transformer** | Request validation |
| **Jest** | Unit and e2e testing |
| **bcrypt** | Password hashing |

### Database

**PostgreSQL** with Prisma ORM. Schema includes 15+ models covering:

- Users, Roles, Permissions (RBAC)
- Vehicles, Vehicle Plates, Vehicle Status History
- Drivers, Driver Status History
- Trips, Trip Status History
- Clients, Contracts
- OTP Verifications, Refresh Tokens (rotation)
- Notifications, Audit Logs (immutable)

## Architecture

```
tms-monorepo/
├── frontend/          # Next.js App Router — React SPA
│   ├── src/
│   │   ├── app/           # Next.js route pages
│   │   ├── components/    # Shared UI components
│   │   ├── features/      # Feature modules (dashboard, trips, vehicles, ...)
│   │   ├── lib/           # Utilities, i18n, API client
│   │   └── store/         # Zustand stores
│   └── ...
├── backend/           # NestJS — Modular REST API
│   ├── src/
│   │   ├── modules/       # Feature modules (auth, trips, vehicles, ...)
│   │   ├── common/        # Shared guards, decorators, pipes, filters
│   │   ├── config/        # Environment configuration
│   │   └── prisma/        # Prisma service
│   ├── prisma/            # Schema, migrations, seed
│   └── ...
├── shared/            # Cross-package types and constants
└── ai-docs/           # Architecture decision records
```

### Architecture Highlights

- **Modular monolith** — Clean separation by domain (trips, vehicles, drivers, clients, contracts)
- **REST API** — Versioned endpoints (`/api/v1/`)
- **JWT Authentication** — Access + refresh token rotation with cookie-based refresh
- **RBAC** — Granular permissions per action per entity
- **Soft Delete** — All entities support soft deletion
- **Audit Trail** — Immutable logs for every state change
- **Validation** — Request validation via `class-validator` with whitelist mode

## Screenshots

> _Screenshots coming soon_

| Dashboard | Trip List | Driver Details | Vehicle Details |
|---|---|---|---|
| _Dashboard view with KPIs and charts_ | _Paginated trip table with filters_ | _Driver profile and assignment history_ | _Vehicle details and status history_ |

## Installation

### Prerequisites

- **Node.js** >= 20.0.0
- **PostgreSQL** >= 14
- **npm** >= 9

### Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Copy environment file and configure
cp .env.example .env
# Edit .env with your PostgreSQL connection string and JWT secrets

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed development data
npm run prisma:seed
```

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Copy environment file and configure
cp .env.example .env.local
# Edit .env.local if needed (defaults point to local backend)

# Generate Prisma client (from root workspace)
npm run prisma:generate -w backend
```

### Environment Variables

**Backend** (`backend/.env`):

| Variable | Description | Default |
|---|---|---|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `3001` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/tms` |
| `JWT_ACCESS_SECRET` | JWT access token signing secret | _required_ |
| `JWT_REFRESH_SECRET` | JWT refresh token signing secret | _required_ |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:3000` |
| `BCRYPT_ROUNDS` | Password hashing rounds | `12` |
| `SMTP_HOST` | SMTP server (future) | — |

**Frontend** (`frontend/.env.local`):

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_APP_NAME` | Application display name | `TMS` |
| `NEXT_PUBLIC_APP_URL` | Frontend URL | `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:3001/api/v1` |
| `NEXT_PUBLIC_REFRESH_COOKIE_NAME` | Refresh token cookie name | `tms_refresh_token` |

### Running Development Environment

```bash
# From root (starts both frontend and backend concurrently)
npm run dev

# Or individually:
npm run dev:frontend   # http://localhost:3000
npm run dev:backend    # http://localhost:3001
```

### Build Commands

```bash
# Build all packages
npm run build

# Individual builds
npm run build:frontend
npm run build:backend

# Type checking
cd frontend && npx tsc --noEmit
cd backend && npx tsc --noEmit

# Linting
npm run lint

# Database management
npm run db:migrate     # Run migrations
npm run db:seed        # Seed development data
npm run db:studio      # Open Prisma Studio
```

## Project Structure

```
tms-monorepo/
├── frontend/src/
│   ├── app/                     # App Router pages
│   │   ├── (auth)/              # Login, OTP, password reset
│   │   └── (dashboard)/         # Dashboard, lists, detail pages
│   ├── components/
│   │   ├── shared/              # Reusable: EmptyState, GlassCard, DataTable, ...
│   │   ├── layout/              # DashboardShell, Sidebar
│   │   └── ui/                  # Base UI components (Button, Input, Badge, ...)
│   ├── features/
│   │   ├── auth/                # Authentication hooks, forms, context
│   │   ├── dashboard/           # Dashboard widgets, charts, KPIs
│   │   ├── trips/               # Trip CRUD, filters, timeline
│   │   ├── vehicles/            # Vehicle management
│   │   ├── drivers/             # Driver management
│   │   ├── clients/             # Client management
│   │   ├── contracts/           # Contract management
│   │   └── notifications/       # Notification system
│   ├── lib/                     # i18n, API client, utilities
│   └── messages/                # Translation files (en, ar)
├── backend/src/
│   ├── modules/
│   │   ├── auth/                # Auth controller, service, strategies, guards
│   │   ├── trips/               # Trip CRUD, status transitions
│   │   ├── vehicles/            # Vehicle CRUD, status history
│   │   ├── drivers/             # Driver CRUD, status history
│   │   ├── clients/             # Client CRUD
│   │   ├── contracts/           # Contract CRUD
│   │   ├── dashboard/           # Dashboard aggregation queries
│   │   ├── notifications/       # Notification creation, queries
│   │   └── audit-logs/          # Audit trail
│   ├── common/                  # Guards, decorators, filters, pipes
│   ├── config/                  # Environment configuration
│   └── prisma/                  # Prisma service
├── prisma/
│   ├── schema.prisma            # Database schema
│   ├── migrations/              # Migration history
│   ├── seed.ts                  # Development seeder
│   └── seed-data.ts             # Seed data
└── shared/src/                  # Shared types and constants
```

## Future Improvements

- Real-time trip tracking with WebSocket or Server-Sent Events
- Export to PDF (trip reports, invoices)
- Advanced reporting engine with custom date ranges
- Vehicle maintenance scheduling with reminders
- Driver performance analytics
- Mobile app (React Native)
- CI/CD pipeline with GitHub Actions
- Docker Compose for one-command setup
- End-to-end testing with Playwright or Cypress

## Author

**Ahmed Ragab**

- GitHub: [@ahmedRagab9948](https://github.com/ahmedRagab9948)
- Project: [transport-management-system](https://github.com/ahmedRagab9948/transport-management-system.git)

---

> Built with TypeScript, Next.js, NestJS, Prisma, and PostgreSQL.
