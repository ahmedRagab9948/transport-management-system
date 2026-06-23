# TMS Hardening Phase — Audit & Implementation Plan

## Audit Status: ✅ Complete

---

## Phase 1: Automatic Statistics Refresh (React Query Invalidation)

### Current State
- Dashboard, Vehicles, Drivers, Clients, Contracts modules all properly invalidate `['dashboard']` on CRUD mutations
- Dispatch Board is completely disconnected from any mutation invalidation
- 4 standalone summary query keys are never invalidated
- Reports, trips picklists, contracts sub-keys have invalidation gaps

### Affected Modules

| Module | Files to Modify |
|--------|----------------|
| Trips | `frontend/src/features/trips/hooks/use-trips.ts` |
| Vehicles | `frontend/src/features/vehicles/hooks/use-vehicles.ts` |
| Drivers | `frontend/src/features/drivers/hooks/use-drivers.ts` |
| Clients | `frontend/src/features/clients/hooks/use-clients.ts` |
| Contracts | `frontend/src/features/contracts/hooks/use-contracts.ts` |

### Implementation Tasks

#### T1.1 — Add dispatch-board invalidation to trip mutations (HIGH)
In `use-trips.ts`, add `queryClient.invalidateQueries({ queryKey: ['dispatch-board'] })` to:
- `useCreateTrip` → onSuccess
- `useUpdateTrip` → onSuccess
- `useDeleteTrip` → onSuccess
- `useUpdateTripStatus` → onSettled

**Files**: `frontend/src/features/trips/hooks/use-trips.ts`

#### T1.2 — Add summary key invalidation to CRUD mutations (HIGH)
In each module's hook file, add invalidation of `['{module}-summary']` to create/update/delete mutations:
- `useCreateVehicle`, `useUpdateVehicle`, `useDeleteVehicle`: add `['vehicles-summary']`
- `useCreateDriver`, `useUpdateDriver`, `useDeleteDriver`: add `['drivers-summary']`
- `useCreateClient`, `useUpdateClient`, `useDeleteClient`: add `['clients-summary']`
- `useCreateContract`, `useUpdateContract`, `useDeleteContract`: add `['contracts-summary']`

**Files**: `features/vehicles/hooks/use-vehicles.ts`, `features/drivers/hooks/use-drivers.ts`, `features/clients/hooks/use-clients.ts`, `features/contracts/hooks/use-contracts.ts`

#### T1.3 — Add trips picklist invalidation to vehicle/driver/client mutations (MEDIUM)
- In `useCreateVehicle`, `useUpdateVehicle`, `useDeleteVehicle`: add `['trips', 'vehicles']`
- In `useCreateDriver`, `useUpdateDriver`, `useDeleteDriver`: add `['trips', 'drivers']`
- In `useCreateClient`, `useUpdateClient`, `useDeleteClient`: add `['trips', 'clients']`

**Files**: Same as T1.2

#### T1.4 — Add contracts sub-key invalidation (MEDIUM)
- In client mutations, add `['contracts', 'clients']` invalidation
- In contract create/update/delete, add `['contracts', 'by-client', clientId]` invalidation

**Files**: `features/clients/hooks/use-clients.ts`, `features/contracts/hooks/use-contracts.ts`

#### T1.5 — Add dispatch-board mutation hooks (MEDIUM)
Create mutation hooks in `dispatch-board/hooks/` for:
- `useDispatchTripStatusChange` — wraps `useUpdateTripStatus` but also invalidates `['dispatch-board']`
- OR: simply ensure all dispatch-board pages call `refetch()` after trip mutations

**Files**: `frontend/src/features/dispatch-board/hooks/use-dispatch-board.ts`

### Impact Estimate
| Task | Files Changed | Lines Changed | Risk |
|------|--------------|---------------|------|
| T1.1 | 1 | ~8 | Low — adding invalidation calls |
| T1.2 | 4 | ~12 | Low — adding invalidation calls |
| T1.3 | 3 | ~6 | Low — adding invalidation calls |
| T1.4 | 2 | ~4 | Low — adding invalidation calls |
| T1.5 | 1 | ~25 | Low — new wrapper hook |

---

## Phase 2: Driver Confirmation Delegation

### Current State
- No `CONFIRM_DRIVER_ON_BEHALF` permission exists
- `DRIVER_CONFIRMED` transition is gated solely by `UPDATE_TRIP` — anyone with it can confirm
- No User-to-Driver relationship in Prisma schema
- Audit trail records `changedById` but no "delegated" flag
- Frontend "Start Trip" button shown based on `UPDATE_TRIP` permission only

### Affected Modules

| Module | Files to Modify |
|--------|----------------|
| Backend Permissions | `backend/prisma/seed-data.ts` |
| Backend Trips Service | `backend/src/modules/trips/services/trips.service.ts` |
| Frontend Permissions | `frontend/src/constants/permissions.ts` |
| Frontend Trip Actions | `frontend/src/features/trips/components/trip-actions.tsx` |
| Frontend Trip Details | `frontend/src/features/trips/components/trip-details-page.tsx` |

### Approach: Permission-only (no driver identity)

The simplest approach adds a `CONFIRM_DRIVER_ON_BEHALF` permission without creating a User→Driver mapping. Any user with this permission can confirm on behalf of a driver. Users without this permission cannot transition to `DRIVER_CONFIRMED`.

#### T2.1 — Add permission to backend seed data
Add to `DOMAIN_PERMISSIONS` array:
```ts
{ key: 'CONFIRM_DRIVER_ON_BEHALF', description: 'Confirm driver status on behalf of the driver' }
```
Assign to admin, manager, and dispatcher roles.

**File**: `backend/prisma/seed-data.ts`

#### T2.2 — Add permission guard to trips service
In `updateStatus()`, add before `validateTransition()`:
```ts
if (dto.status === TripStatus.DRIVER_CONFIRMED && !user.permissions.includes('CONFIRM_DRIVER_ON_BEHALF')) {
  throw new ForbiddenException('Only authorized personnel can confirm driver status');
}
```

**File**: `backend/src/modules/trips/services/trips.service.ts`

#### T2.3 — Add permission key to frontend
Add `CONFIRM_DRIVER_ON_BEHALF: 'CONFIRM_DRIVER_ON_BEHALF'` to `PERMISSIONS` object.

**File**: `frontend/src/constants/permissions.ts`

#### T2.4 — Update frontend UI gating
In `trip-actions.tsx` and `trip-details-page.tsx`, update `canStart`:
```ts
const canConfirm = hasPermission(PERMISSIONS.UPDATE_TRIP) && hasPermission(PERMISSIONS.CONFIRM_DRIVER_ON_BEHALF);
const canStart = canConfirm && STARTABLE_STATUSES.includes(trip.status);
```

**Files**: `frontend/src/features/trips/components/trip-actions.tsx`, `trip-details-page.tsx`

### Future Enhancement (out of scope for this phase)
- Add `userId` to `Driver` model for true driver-identity enforcement
- Include `driverId` in JWT payload
- Allow drivers to self-confirm without the delegation permission

### Impact Estimate
| Task | Files Changed | Lines Changed | Risk |
|------|--------------|---------------|------|
| T2.1 | 1 | ~5 | Low — seed data addition |
| T2.2 | 1 | ~5 | Low — service guard |
| T2.3 | 1 | ~1 | Low — constant addition |
| T2.4 | 2 | ~4 | Low — conditional gating |

---

## Phase 3: Sidebar Information Architecture

### Current State
File: `frontend/src/constants/navigation.ts`

Current order (4 sections):
- **Overview**: Dashboard
- **Operations**: Dispatch Board → Trips → Vehicles → Drivers → Clients → Contracts
- **Insights**: Reports
- **Administration**: Audit Logs → Users (coming soon) → Settings

Proposed order (4 sections, reordered):
- **Overview**: Dashboard
- **Operations**: Clients → Contracts → Dispatch Board → Trips → Vehicles → Drivers
- **Insights**: Reports
- **Administration**: Audit Logs → Users → Settings

### Implementation
Only one file needs modification: `frontend/src/constants/navigation.ts`
- Reorder the items in the `NAVIGATION_REGISTRY` array
- No code changes to sidebar components (order is config-driven)

### Impact Estimate
| Task | Files Changed | Lines Changed | Risk |
|------|--------------|---------------|------|
| T3.1 | 1 | ~10 (move lines) | Low — pure array reorder |

---

## Phase 4: Arabic Localization Audit

### Current State
- 785 keys in en.json, 785 keys in ar.json — structurally identical
- 15 keys referenced in components but missing from both JSON files
- 6 hardcoded English strings in components
- 2 minute-suffix hardcodings in dispatch board trip card
- Default locale is English (not Arabic)
- Translation keys use `t('...')` pattern with nested JSON

### Affected Modules

| Module | Files to Modify |
|--------|----------------|
| i18n Messages | `frontend/src/messages/en.json`, `ar.json` |
| Trip Card | `frontend/src/features/dispatch-board/components/trip-card.tsx` |
| Breadcrumb | `frontend/src/components/ui/breadcrumb.tsx` |
| Toast | `frontend/src/components/ui/toast.tsx` |
| Language Toggle | `frontend/src/components/ui/language-toggle.tsx` |
| App Layout | `frontend/src/app/layout.tsx` |

### Implementation Tasks

#### T4.1 — Add 15 missing translation keys
Add to both en.json and ar.json:

```json
"common": {
  "new_password": "New Password",
  "error": "Error"
},
"auth": {
  "send_reset_link": "Send Reset Link"
},
"validation": {
  "password_min_length": "Password must be at least {min} characters",
  "passwords_mismatch": "Passwords do not match"
},
"search": {
  "result_label": "Search results for {query}"
},
"notifications": {
  "unread_count": "{count} unread notifications"
},
"common_statuses": {
  "expired": "Expired",
  "terminated": "Terminated"
},
"filters": {
  "expired": "Expired",
  "terminated": "Terminated"
},
"vehicles": {
  "vehicle_details": "Vehicle Details"
},
"details": {
  "financial_information": "Financial Information",
  "vehicle_specifications": "Vehicle Specifications"
},
"audit_logs": {
  "no_logs_desc": "No audit logs found for the selected criteria"
}
```

**Files**: `frontend/src/messages/en.json`, `ar.json`

#### T4.2 — Fix hardcoded English strings
- `breadcrumb.tsx:11`: Replace `aria-label="breadcrumb"` with `t('common.breadcrumb')`
- `toast.tsx:99`: Replace `aria-label="Dismiss notification"` with `t('toast.dismiss')`
- `language-toggle.tsx`: Replace bilingual hardcoding with `t('common.switch_language')` + `t('common.current_language')`
- `layout.tsx:21-22`: Make metadata dynamic based on locale

**Files**: `breadcrumb.tsx`, `toast.tsx`, `language-toggle.tsx`, `layout.tsx`

#### T4.3 — Fix dispatch board minute suffix
Replace hardcoded `{trip.ageMinutes}m` and `{...}m` in `trip-card.tsx` with a locale-aware formatter or translation key like `t('dispatch_board.trip_card.minutes', { count: trip.ageMinutes })`.

**File**: `frontend/src/features/dispatch-board/components/trip-card.tsx`

#### T4.4 — Verify Arabic-first experience
- Ensure `ar.json` is complete (all 785 keys filled)
- Set default locale toggle behavior (if 80%+ users are Arabic, consider making `ar` the default)
- Verify RTL CSS rules in `globals.css` cover all components

### Impact Estimate
| Task | Files Changed | Lines Changed | Risk |
|------|--------------|---------------|------|
| T4.1 | 2 | ~30 | Low — JSON additions |
| T4.2 | 4 | ~15 | Low — string replacements |
| T4.3 | 1 | ~4 | Medium — format logic change |
| T4.4 | 1 | ~10 | Low — CSS review |

---

## Phase 5: Dispatch Board UI Polish

### Current State
- Trip card: `p-3` (12px padding), estimateSize 120px
- Column width: 280px, gap: 12px
- Board min-width: 2032px
- 4 critical RTL issues
- 2 hardcoded "m" suffixes
- Stats grid: 6 items but maps to max 4 columns

### Affected Modules

| Module | Files to Modify |
|--------|----------------|
| Trip Card | `dispatch-board/components/trip-card.tsx` |
| Status Column | `dispatch-board/components/status-column.tsx` |
| Kanban Board | `dispatch-board/components/dispatch-kanban.tsx` |
| Stats | `dispatch-board/components/dispatch-board-stats.tsx` |
| Mobile View | `dispatch-board/components/mobile-dispatch-view.tsx` |
| Resources | `dispatch-board/components/available-resources.tsx` |

### Implementation Tasks

#### T5.1 — Fix RTL issues (HIGH)
- **R1**: Replace `border-l-*` with `border-s-*` in stats component (6 occurrences)
- **R2**: Replace `left: 0` with `insetInlineStart: 0` in status-column virtualizer
- **R3**: Make `side="right"` dynamic based on `isRTL` in available-resources SheetContent
- **R4**: Replace `pr-4` with `pe-4` in mobile-dispatch-view

**Files**: `dispatch-board-stats.tsx`, `status-column.tsx`, `available-resources.tsx`, `mobile-dispatch-view.tsx`

#### T5.2 — Reduce card padding (MEDIUM)
- `trip-card.tsx`: Reduce `p-3` to `p-2.5` (10px → 12px) to save vertical space
- `trip-card.tsx`: Reduce `gap-2` to `gap-1.5` where possible
- `status-column.tsx`: Reduce `p-2` on ScrollArea to `p-1.5`

**Files**: `trip-card.tsx`, `status-column.tsx`

#### T5.3 — Fix stats grid column mapping (MEDIUM)
- Fix `StatsGrid` `columnsMap` to handle `key=6` correctly, or reduce stats to 4 items, or add custom grid class

**Files**: `dispatch-board-stats.tsx`, potentially `stats-grid.tsx`

#### T5.4 — Optimize client/cargo truncation (LOW)
- `trip-card.tsx`: Replace fixed `max-w-[120px]` and `max-w-[180px]` with percentage-based or flex-based truncation

**Files**: `trip-card.tsx`

#### T5.5 — Increase board usable area (LOW)
- `dispatch-kanban.tsx`: Consider reducing `gap-3` to `gap-2`
- Review whether all 7 status columns need to be visible simultaneously or if some can be collapsed

**Files**: `dispatch-kanban.tsx`

#### T5.6 — Improve mobile responsive layout (LOW)
- `mobile-dispatch-view.tsx`: Replace `max-h-[calc(100vh-280px)]` with `max-h-[calc(100dvh-280px)]`

**Files**: `mobile-dispatch-view.tsx`

### Impact Estimate
| Task | Files Changed | Lines Changed | Risk |
|------|--------------|---------------|------|
| T5.1 | 4 | ~12 | Medium — RTL is visual, easy to verify |
| T5.2 | 2 | ~6 | Low — padding adjustments |
| T5.3 | 1-2 | ~4 | Low — column fix |
| T5.4 | 1 | ~4 | Low — width adjustments |
| T5.5 | 1 | ~2 | Low — gap adjustment |
| T5.6 | 1 | ~1 | Low — unit change |

---

## Consolidated Impact Summary

| Phase | Total Files | Total Lines Changed | Risk Level | Priority |
|-------|-------------|---------------------|------------|----------|
| P1: Auto Refresh | 7 | ~55 | Low | HIGH |
| P2: Driver Delegation | 6 | ~15 | Low | MEDIUM |
| P3: Sidebar IA | 1 | ~10 | Low | LOW |
| P4: Arabic L10n | 7 | ~59 | Low-Medium | HIGH |
| P5: Dispatch UI | 6 | ~29 | Low-Medium | MEDIUM |
| **Total** | **~27** | **~168** | **Low overall** | |

## Implementation Order (Recommended)

1. **Phase 4** (Arabic L10n) — simplest wins, high user-facing impact
2. **Phase 3** (Sidebar IA) — trivial reorder, immediate UX improvement
3. **Phase 1** (Auto Refresh) — high reliability impact, low risk
4. **Phase 5** (Dispatch UI) — visible polish, some RTL risk
5. **Phase 2** (Driver Delegation) — new feature, needs testing

## Feature Branch Strategy

Create feature branches from `main` in this order:
1. `fix/i18n-audit`
2. `fix/sidebar-ia`
3. `fix/query-invalidation`
4. `fix/dispatch-ui`
5. `feat/driver-delegation`

Each branch must pass `tsc --noEmit` and `prisma db seed` before merge.

## QA Checklist (Pre-Merge)

- [ ] `tsc --noEmit` passes (backend + frontend)
- [ ] `prisma db seed` succeeds (backend)
- [ ] All dashboard endpoints return 200 (smoke test)
- [ ] Dispatch board renders in both LTR and RTL modes
- [ ] No `border-l-*` or `border-r-*` in dispatch board components (replaced with `border-s-*`/`border-e-*`)
- [ ] All 15 missing translation keys appear correctly in both locales
- [ ] Trip card minute suffix displays correctly in both locales
- [ ] Sidebar shows proposed order for all 4 user roles
- [ ] Login as dispatcher → can start trip (DRIVER_CONFIRMED) with CONFIRM_DRIVER_ON_BEHALF
- [ ] Login as viewer → cannot start trip (403 or button hidden)
- [ ] Create/edit/delete any entity → related dashboard summary refreshes without manual page reload
- [ ] Create/edit/delete any entity → related list page summary refreshes automatically
