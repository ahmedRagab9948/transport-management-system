# Frontend Guidelines
## Transport Management System (TMS)

Frontend Stack:
- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Zustand
- TanStack Query
- React Hook Form
- Zod

Architecture Style:
- Feature-Based Architecture
- Scalable Structure
- Reusable Components
- Clean Code Principles

---

# Project Structure

src/
│
├── app/
├── components/
├── features/
├── services/
├── hooks/
├── store/
├── types/
├── utils/
├── constants/
├── providers/
├── lib/
├── styles/

---

# Folder Responsibilities

## app/

Contains:
- Next.js routes
- layouts
- pages

Examples:
- dashboard/
- trips/
- vehicles/

---

# components/

Reusable shared components.

Examples:
- ui/
- layout/
- shared/

---

# features/

Feature-specific modules.

Each feature contains:
- components
- hooks
- services
- schemas
- types

Examples:
- trips/
- vehicles/
- drivers/

---

# services/

API layer.

Responsibilities:
- Axios configuration
- API requests
- Token handling

---

# hooks/

Reusable custom hooks.

Examples:
- useDebounce
- usePagination
- useAuth

---

# store/

Global state management.

Use:
- Zustand

Avoid:
- Overusing global state

---

# types/

Global TypeScript types/interfaces.

Examples:
- api.types.ts
- trip.types.ts

---

# utils/

Pure utility functions.

Examples:
- date formatting
- currency formatting
- helpers

---

# constants/

Static constants.

Examples:
- route names
- statuses
- permissions

---

# providers/

Application providers.

Examples:
- QueryProvider
- ThemeProvider

---

# Naming Conventions

---

# File Naming

Use:
- kebab-case

Examples:
- trip-table.tsx
- vehicle-form.tsx

---

# Component Naming

Use:
- PascalCase

Examples:
- TripTable
- DriverCard

---

# Hook Naming

Use:
- use prefix

Examples:
- useTrips
- useAuth

---

# Type Naming

Use:
- PascalCase

Examples:
- Trip
- Driver
- VehicleStatus

---

# Component Rules

Components should:
- Be reusable
- Be small and focused
- Avoid massive files

Recommended:
- One responsibility per component

Avoid:
- 1000-line components

---

# Smart vs Dumb Components

## Smart Components

Responsible for:
- data fetching
- state logic

## Dumb Components

Responsible for:
- UI only

Preferred:
- Separate logic from UI

---

# State Management Rules

Use:
- Local state for UI-only logic
- Zustand for global app state
- TanStack Query for server state

Avoid:
- Storing API data in Zustand unnecessarily

---

# API Handling

Use:
- Centralized API services

Avoid:
- Fetch calls directly inside components

---

# Form Handling

Use:
- React Hook Form
- Zod validation

Requirements:
- Client-side validation
- Error messages
- Disabled submit while loading

---

# Error Handling

Every request should handle:
- loading
- success
- error

Use:
- toast notifications
- error boundaries where appropriate

---

# Tables

All tables should support:
- pagination
- sorting
- filtering
- search
- loading skeleton

Use:
- TanStack Table

---

# Styling Rules

Use:
- Tailwind utility classes

Avoid:
- Massive custom CSS files

Use:
- class-variance-authority when needed

---

# Dark Mode

Application must support:
- Dark mode
- Light mode

All components should:
- respect theme colors

---

# Authentication

Use:
- JWT access token
- Refresh token

Store:
- Securely

Avoid:
- Storing sensitive data in localStorage unnecessarily

---

# Route Protection

Protected routes should:
- verify authentication
- verify permissions

Unauthorized users:
- redirected properly

---

# Permission System

UI should respect:
- Role permissions

Examples:
- Hide delete buttons
- Disable edit actions

---

# Loading UX

Prefer:
- Skeleton loaders

Avoid:
- Full-screen spinners

---

# Performance Rules

Use:
- lazy loading
- dynamic imports
- memoization when needed

Avoid:
- premature optimization

---

# Accessibility

Support:
- keyboard navigation
- semantic HTML
- aria labels

---

# Code Quality

Use:
- ESLint
- Prettier

Code should be:
- readable
- modular
- maintainable

---

# Git Workflow

Branch naming examples:
- feature/trips-module
- feature/auth-system
- fix/vehicle-filter

Commit examples:
- feat: add trips table
- fix: resolve login redirect bug

---

# Reusable Components

Important shared components:
- DataTable
- StatusBadge
- PageHeader
- SearchBar
- ConfirmDialog
- FormModal
- EmptyState
- LoadingSkeleton

---

# Security Rules

Never:
- expose secrets
- trust frontend validation alone

Always:
- validate permissions from backend

---

# Design Principles

Frontend should feel:
- Fast
- Clean
- Professional
- Enterprise-grade
- Easy to use daily

---

# Future Frontend Features

Planned:
- Real-time updates
- WebSocket notifications
- Maps integration
- Drag-and-drop scheduling
- Offline support
- PWA support