# Backend Guidelines
## Transport Management System (TMS)

Backend Stack:
- NestJS
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT Authentication

Architecture Style:
- Modular Architecture
- Clean Architecture Principles
- Scalable Backend Structure

---

# Project Structure

src/
│
├── modules/
├── common/
├── config/
├── prisma/
├── guards/
├── interceptors/
├── filters/
├── decorators/
├── pipes/
├── types/
├── utils/

---

# Modules Structure

Each module should contain:

module-name/
│
├── controllers/
├── services/
├── dto/
├── entities/
├── repositories/
├── enums/
├── interfaces/
├── validators/

---

# Example Modules

- auth
- users
- roles
- permissions
- drivers
- vehicles
- trips
- clients
- contracts

---

# Modular Principles

Each module should:
- be isolated
- own its business logic
- avoid tight coupling

Avoid:
- cross-module direct dependency abuse

---

# Controllers

Responsibilities:
- Handle requests
- Validate inputs
- Return responses

Avoid:
- Business logic inside controllers

Controllers should stay thin.

---

# Services

Responsibilities:
- Business logic
- Database operations
- Validation logic
- Workflow logic

Services should:
- remain reusable
- remain testable

---

# DTOs

Use DTOs for:
- request validation
- typing
- API contracts

Use:
- class-validator
- class-transformer

Examples:
- CreateTripDto
- UpdateVehicleDto

---

# Validation Rules

Every input should be validated.

Validate:
- email
- phone
- dates
- enums
- UUIDs

Never trust client input.

---

# Prisma Usage

Use:
- Prisma ORM

Rules:
- Keep queries clean
- Avoid duplicated queries
- Use transactions where necessary

---

# Database Transactions

Use transactions for:
- Trip assignment
- Vehicle assignment
- Status updates

Reason:
- prevent inconsistent data

---

# Authentication

Use:
- JWT Access Token
- Refresh Token
- OTP Verification

Features:
- login
- logout
- refresh
- revoke sessions

---

# Authorization

Use:
- RBAC (Role-Based Access Control)

Every protected endpoint should:
- validate permissions

Examples:
- CREATE_TRIP
- DELETE_USER

---

# Guards

Use guards for:
- authentication
- permissions
- roles

Examples:
- JwtAuthGuard
- PermissionsGuard

---

# Error Handling

Use:
- global exception filters

Standardize:
- API error responses

Avoid:
- raw database errors

---

# Logging

Use structured logging.

Log:
- errors
- important actions
- authentication events

Avoid:
- logging sensitive data

---

# Audit Logging

Critical actions must create audit logs.

Examples:
- deleting trips
- updating permissions
- vehicle assignments

---

# API Response Structure

Standard response format:

Success:
{
  success: true,
  data: {},
  message: ""
}

Error:
{
  success: false,
  error: "",
  message: ""
}

---

# File Uploads

Use:
- Cloudinary or S3

Supported uploads:
- licenses
- contracts
- vehicle documents

Validate:
- file type
- size

---

# Security Rules

Use:
- Helmet
- Rate Limiting
- CORS configuration

Never:
- expose secrets
- expose stack traces

---

# Environment Variables

Use:
- .env files

Examples:
- DATABASE_URL
- JWT_SECRET
- SMTP_HOST

Never commit:
- secrets
- API keys

---

# Caching

Future support:
- Redis caching

Use cases:
- dashboard stats
- reports
- frequent lookups

---

# Notifications

Future support:
- email notifications
- SMS notifications
- in-app notifications

---

# Queue System

Future support:
- BullMQ

Use cases:
- sending OTPs
- notifications
- report generation

---

# Background Jobs

Use background workers for:
- scheduled reminders
- maintenance alerts
- expired license checks

---

# WebSocket Support

Future support:
- real-time trip updates
- notifications
- dashboard live updates

---

# Testing

Use:
- Unit Tests
- Integration Tests

Test:
- services
- critical workflows
- authentication

---

# Performance Rules

Use:
- pagination
- query optimization
- indexing

Avoid:
- N+1 queries

---

# Pagination Rules

All list endpoints should support:
- page
- limit
- sorting
- filtering
- search

---

# Filtering Rules

Support filtering by:
- status
- date
- client
- driver
- vehicle

---

# API Versioning

Use:
- /api/v1/

Example:
- /api/v1/trips

---

# Soft Delete

Critical entities should use:
- deleted_at

Avoid:
- permanent deletion

---

# Code Quality

Use:
- ESLint
- Prettier

Code should be:
- readable
- modular
- scalable

---

# Git Workflow

Branch examples:
- feature/auth-module
- feature/trips-module

Commit examples:
- feat: add vehicle assignment logic
- fix: resolve JWT expiration issue

---

# Future Backend Features

Planned:
- GPS tracking
- Live trip monitoring
- AI analytics
- Predictive maintenance
- Fuel consumption tracking
- Multi-tenant architecture

---

# Design Principles

Backend should be:
- Secure
- Scalable
- Maintainable
- Audit-friendly
- Enterprise-grade
```