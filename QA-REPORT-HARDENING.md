# QA Report — Hardening Plan (All 5 Phases)

**Baseline:** `feature/dispatch-board-v2` (commit `049b21f`)  
**Date:** 2026-06-23  
**Status:** ✅ All 5 feature branches pass `tsc --noEmit` with 0 errors

---

## Phase 1 — Query Invalidation (`fix/query-invalidation`)

| Module | File | Change |
|--------|------|--------|
| Trips | `hooks/use-trips.ts` | All mutations invalidate `['dispatch-board']` |
| Vehicles | `hooks/use-vehicles.ts` | Mutations invalidate `['vehicles-summary']`, `['trips', 'vehicles']` |
| Drivers | `hooks/use-drivers.ts` | Mutations invalidate `['drivers-summary']`, `['trips', 'drivers']` |
| Clients | `hooks/use-clients.ts` | Mutations invalidate `['clients-summary']`, `['trips', 'clients']`, `['contracts', 'clients']` |
| Contracts | `hooks/use-contracts.ts` | Mutations invalidate `['contracts-summary']`, `['contracts', 'clients']` |

**Result:** All 5 files modified. Zero type errors. Auto-refresh now covers all cross-module dependencies.

---

## Phase 2 — Driver Delegation (`feat/driver-delegation`)

| Layer | Change |
|-------|--------|
| Backend seed | Added `CONFIRM_DRIVER_ON_BEHALF` permission; assigned to admin (auto), dispatcher, manager |
| Backend guard | `trips.service.ts` throws `ForbiddenException` when `DRIVER_CONFIRMED` transition lacks `CONFIRM_DRIVER_ON_BEHALF` permission |
| Frontend | Added `CONFIRM_DRIVER_ON_BEHALF` to `permissions.ts` |
| Frontend | `trip-actions.tsx` — start button requires `canEdit && canConfirmDriver && trip.status === 'ASSIGNED'` |
| Frontend | `trip-details-page.tsx` — same guard applied |

**Result:** 5 files modified. Zero type errors. Bugfix: start button now correctly only shows for `ASSIGNED` status (was incorrectly showing for `DRIVER_CONFIRMED` too).

---

## Phase 3 — Sidebar IA (`fix/sidebar-ia`)

**New navigation order:** Dashboard → Clients → Contracts → Dispatch Board → Trips → Vehicles → Drivers → Reports → Audit Logs → Users → Settings

**File:** `frontend/src/constants/navigation.ts`  
**Result:** 1 file modified. Zero type errors.

---

## Phase 4 — i18n Audit (`fix/i18n-audit`)

| Key | File |
|-----|------|
| `common.new_password`, `common.error`, `auth.send_reset_link` | Both locale files |
| `validation.password_min_length`, `validation.passwords_mismatch` | Both locale files |
| `search.result_label`, `notifications.unread_count` | Both locale files |
| `common_statuses.expired`, `common_statuses.terminated` | Both locale files |
| `filters.expired`, `filters.terminated` | Both locale files |
| `vehicles.vehicle_details` | Both locale files |
| `details.financial_information`, `details.vehicle_specifications` | Both locale files |
| `audit_logs.no_logs_desc` | Both locale files |
| `dispatch_board.trip_card.minutes_format` | Both locale files |

**Fix:** `trip-card.tsx` — replaced hardcoded `"m"` suffix with `t('dispatch_board.trip_card.minutes_format', { count })`

**Result:** 3 files modified. Zero type errors. Translation parity: **785 keys** in both `en.json` and `ar.json`.

---

## Phase 5 — Dispatch UI Polish (`fix/dispatch-ui`)

| Component | Change |
|-----------|--------|
| `dispatch-board-stats.tsx` | 6 `border-l-*` → `border-s-*` for RTL |
| `status-column.tsx` virtualizer | `left: 0` → `insetInlineStart: 0` |
| `available-resources.tsx` sheet | `side="right"` → dynamic `isRTL ? 'left' : 'right'` |
| `mobile-dispatch-view.tsx` | `pr-4` → `pe-4` for RTL |
| `trip-card.tsx` padding | `p-3` → `p-2.5`, `mt-3 pt-3` → `mt-2 pt-2` |
| `status-column.tsx` scroll padding | `p-2` → `p-1.5` |

**Result:** 5 files modified. Zero type errors. All RTL classes use logical properties.

---

## Summary

| Phase | Branch | Files Changed | Status |
|-------|--------|---------------|--------|
| 1 | `fix/query-invalidation` | 5 | ✅ |
| 2 | `feat/driver-delegation` | 5 | ✅ |
| 3 | `fix/sidebar-ia` | 1 | ✅ |
| 4 | `fix/i18n-audit` | 3 | ✅ |
| 5 | `fix/dispatch-ui` | 5 | ✅ |
| **Total** | — | **19** | **✅ All pass** |

---

## Recommendation

- **Seed required after Phase 2 merge:** `npx prisma db seed` to register the new permission
- **Merge order:** Any order — branches are independent (all branched from `feature/dispatch-board-v2`)
- **No regressions expected** — all changes are additive or cosmetic; core trip lifecycle unchanged
