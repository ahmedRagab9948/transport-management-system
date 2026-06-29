# Sprint R2 — Frontend Architecture Audit Report

**Date:** 2026-06-26  
**Scope:** `frontend/src/` — 13 features, 30+ shared components, ~25k lines  
**Method:** Static analysis via grep, glob, and file reading  
**Goal:** Architecture-only — no feature changes, no API changes, no schema changes

---

## Executive Summary

**62 findings** across 10 categories.  
- **Critical:** 3 (broken i18n)  
- **High:** 18 (duplication, performance, theming, stale cache)  
- **Medium:** 28 (inconsistencies, dead code, missing patterns)  
- **Low:** 13 (minor style, edge cases)

Top priorities: remove dead duplicate components (~1,100 lines), eliminate hardcoded colors across 10 files, fix sub-sector cache invalidation bug, audit missing translations.

---

## 1. Critical Findings

### C1. Missing translation key `validation.contract_active_requirements`

- **Files:** `features/contracts/schemas/contract.schema.ts:38,66`  
- **Issue:** Schema validation references `t('validation.contract_active_requirements')` which does NOT exist in `en.json` or `ar.json`. The raw key string will be displayed to users.  
- **Impact:** Users see `validation.contract_active_requirements` text  
- **Fix:** Add key to both locale files  
- **Effort:** 15 min

### C2. Hardcoded English validation messages in `sector-form.tsx`

- **File:** `features/sectors/components/sector-form.tsx:15-16,21-22`  
- **Issue:** Zod schema uses `'Name is required'` and `'Code is required'` instead of `t()`  
- **Impact:** Untranslatable, ignores Arabic locale  
- **Fix:** Move schema to `schemas/`, wrap messages with `t()`  
- **Effort:** 30 min

### C3. Hardcoded English plate role labels in `update-vehicle-form.tsx`

- **File:** `features/vehicles/forms/update-vehicle-form.tsx:33-36`  
- **Issue:** `'Truck Head'`, `'Trailer Unit'`, `'Jumbo'` instead of `t('vehicles.truck_head')` etc. The create form correctly uses translation keys  
- **Impact:** Update form ignores locale  
- **Fix:** Replace with translation keys (matching create form pattern)  
- **Effort:** 10 min

---

## 2. High Severity

### H1. Five identical orphaned pagination components

- **Files:**
  - `features/vehicles/components/vehicles-pagination.tsx` (72 lines)
  - `features/trips/components/trips-pagination.tsx` (72 lines)
  - `features/drivers/components/drivers-pagination.tsx` (72 lines)
  - `features/clients/components/clients-pagination.tsx` (72 lines)
  - `features/contracts/components/contracts-pagination.tsx` (72 lines)
- **Issue:** Each feature has its own identical pagination component. **None are imported anywhere** — all list pages use `DataTableWrapper` which renders the shared `DataTablePagination`  
- **Impact:** ~360 lines dead code, maintenance burden  
- **Fix:** Delete all 5 files  
- **Effort:** 10 min

### H2. Five orphaned filter components

- **Files:**
  - `features/vehicles/components/vehicle-filters.tsx` (120 lines)
  - `features/drivers/components/driver-filters.tsx` (92 lines)
  - `features/clients/components/client-filters.tsx` (72 lines)
  - `features/contracts/components/contract-filters.tsx`
  - `features/trips/components/trip-filters.tsx`
- **Issue:** All five are never imported. List pages use the shared `AdvancedFilters` component instead  
- **Impact:** ~400+ lines dead code  
- **Fix:** Delete all 5 files  
- **Effort:** 10 min

### H3. 79+ hardcoded Tailwind color classes break theming

- **Files:** `status-badge.tsx`, `button.tsx`, `base-stat-card.tsx`, `audit-logs-page.tsx`, `notification-type.config.ts`, `trip-card.tsx`, `available-resources.tsx`, `system-alerts.tsx`, `conflict-warning-dialog.tsx`, `trip-timeline.tsx`, `recent-activity.tsx`  
- **Issue:** Colors like `emerald-500`, `amber-500`, `rose-500`, `blue-500`, `indigo-500` are hardcoded instead of using CSS variables or design tokens  
- **Impact:** Theme switching broken; dark mode inconsistencies  
- **Suggested fix:** Define semantic CSS variables (`--color-success`, `--color-warning`, etc.) and replace hardcoded values  
- **Effort:** 1-2 days

### H4. Sub-sector key naming causes stale cache

- **Hook files:** `features/sectors/hooks/use-sub-sectors.ts`  
- **Issue:** List uses `['sectors', 'sub-sectors', sectorId]` (plural), update uses `['sectors', 'sub-sector', id]` (singular). Update mutations invalidate singleton key only — list is never invalidated  
- **Impact:** After editing a sub-sector, the list shows stale data until manual refresh  
- **Fix:** Standardize on `['sectors', 'sub-sectors', ...]` everywhere; ensure list invalidated on create/update/delete  
- **Effort:** 30 min

### H5. `['sectors-summary']` never invalidated

- **File:** `features/sectors/hooks/use-sectors.ts` (inline query in `sectors-list-page.tsx:50`)  
- **Issue:** Summary KPI cards query `['sectors-summary']` but no mutation invalidates this key  
- **Impact:** Summary cards remain stale after create/update/delete  
- **Fix:** Add invalidation in sector create/update/delete mutations  
- **Effort:** 15 min

### H6. `t('common.search') + '...'` concatenation not translatable

- **Files:** `create-trip-form.tsx`, `create-contract-form.tsx`, `update-contract-form.tsx` (8 total)  
- **Issue:** `placeholder={t('common.search') + '...'}` — the `...` suffix is concatenated in JS, so Arabic gets Latin ellipsis  
- **Impact:** Poor i18n for RTL languages  
- **Fix:** Use dedicated key like `filters.search_placeholder`  
- **Effort:** 30 min

### H7. Duplicate `data-table-shell.tsx` and `data-table-pagination.tsx` at root level

- **Files:**
  - `components/shared/data-table-shell.tsx` (384 lines — **dead**)
  - `components/shared/data-table-pagination.tsx` (74 lines — **dead**)
  - (Canonical versions live in `components/shared/data-table/`)
- **Issue:** Root-level copies are stale; barrel imports from subdirectory  
- **Impact:** 458 lines dead code  
- **Fix:** Delete both root-level files  
- **Effort:** 5 min

### H8. Zero `React.memo` usage on shared components

- **Scope:** All 30+ shared components, all 13 feature component sets  
- **Issue:** No component uses `React.memo`. Shared components like `DataTableShell`, `StatusBadge`, `PageHeader`, `SummaryCards` re-render on every parent render  
- **Impact:** Unnecessary re-renders in list pages, detail pages, and dashboards  
- **Fix:** Strategic `React.memo` on leaf shared components and pure display components  
- **Effort:** 1 day

### H9. Zero `React.lazy` / `next/dynamic` usage

- **Scope:** All page components, chart components, dialog components  
- **Issue:** No code splitting. `dashboard-page.tsx`, `reports-page.tsx`, `dispatch-board-page.tsx`, chart widgets are all eagerly loaded  
- **Impact:** Larger initial bundle, slower TTI  
- **Fix:** `dynamic()` imports for route-level pages and heavy components (charts, dispatch board)  
- **Effort:** 1 day

### H10. Sector form doesn't use shared form patterns

- **File:** `features/sectors/components/sector-form.tsx`  
- **Issues:** (a) Schema defined inline (all others use separate schema files) (b) Missing `useFormAutoFocus` (c) Missing `useScrollToError` (d) Missing `useUnsavedChanges` (e) Raw `<p>` error display instead of `<FieldError>` component  
- **Impact:** Inconsistent UX, missing error scroll behavior  
- **Fix:** Extract schema, adopt shared form utilities from `lib/forms/`  
- **Effort:** 1 hour

### H11. Dashboard query keys use camelCase sub-keys

- **File:** `features/dashboard/hooks/use-dashboard.ts`  
- **Issue:** `['dashboard', 'tripsStatus', 'monthlyTrips', 'vehicleUtilization', ...]` — all camelCase. Every other feature uses kebab-case: `['dispatch-board', 'stats']`, `['notifications', 'unread-count']`  
- **Impact:** Inconsistent pattern; confusing for new developers  
- **Fix:** Rename to kebab-case sub-keys  
- **Effort:** 30 min

### H12. `Detail` vs `Details` naming inconsistency

- **Files:**
  - `features/sectors/components/sector-detail-page.tsx` (singular **Detail**)
  - `features/vehicles/components/vehicle-details-page.tsx` (plural **Details**)
  - Same pattern in component names and file names
- **Impact:** Confusing naming — 1 feature breaks the convention  
- **Fix:** Rename to `SectorDetailsPage` / `sector-details-page.tsx`  
- **Effort:** 15 min

### H13. `common_statuses` and `filters` namespaces share 8 identical keys

- **Files:** `en.json`, `ar.json`  
- **Issue:** Both namespaces define `active`, `inactive`, `suspended`, `draft`, `completed`, `cancelled`, `expired`, `terminated` with identical values. Hard to keep in sync  
- **Impact:** Maintenance burden, potential inconsistency  
- **Fix:** Choose one canonical namespace, reference from the other  
- **Effort:** 1 hour

### H14. Global `Search` icon SVG inlined in 6+ filter components

- **Files:** `global-search.tsx`, `vehicle-filters.tsx`, `driver-filters.tsx`, `client-filters.tsx`, `data-table-shell.tsx`, `contract-filters.tsx`  
- **Issue:** The search icon SVG path is repeated 6+ times. If the icon changes, all must be updated  
- **Impact:** Maintenance burden  
- **Fix:** Extract to shared `SearchIcon` component or use lucide-react import consistently  
- **Effort:** 30 min

### H15. `Search` icon inlined versus imported from lucide-react

- **Issue:** Some files use `import { Search } from 'lucide-react'`, others inline the SVG path directly  
- **Files:** `features/trips/components/trip-filters.tsx` (inline), `features/vehicles/components/vehicle-filters.tsx` (inline), `components/shared/global-search.tsx` (lucide import)  
- **Impact:** Inconsistent, harder to maintain  
- **Fix:** Standardize on lucide-react imports  
- **Effort:** 20 min

### H16. Three error boundary `useEffect` patterns duplicated across 7 files

- **Files:** All 7 `error.tsx` files in `app/(dashboard)/*`  
- **Issue:** Identical 37-line pattern with only the translation key differing  
- **Impact:** ~185 lines duplication  
- **Fix:** Create shared `DashboardErrorBoundary` component  
- **Effort:** 30 min

### H17. Auth forms in `components/` instead of `forms/`

- **Files:** `features/auth/components/login-form.tsx`, `forgot-password-form.tsx`, `otp-form.tsx`, `reset-password-form.tsx`  
- **Issue:** All CRUD features (clients, contracts, drivers, vehicles, trips, sectors) have a dedicated `forms/` directory. Auth places form components in `components/`  
- **Impact:** Inconsistent architecture  
- **Fix:** Move to `features/auth/forms/`  
- **Effort:** 15 min

### H18. `sector-query-keys.ts` in hooks/ directory

- **File:** `features/sectors/hooks/sector-query-keys.ts`  
- **Issue:** This file exports query key factory functions, NOT a React hook. Placed in `hooks/` incorrectly  
- **Impact:** Misleading location  
- **Fix:** Move to `features/sectors/constants/`  
- **Effort:** 10 min

---

## 3. Medium Severity

| ID | Finding | File(s) | Effort |
|----|---------|---------|--------|
| M1 | Missing `index.ts` barrel in dashboard feature | `features/dashboard/` | 10 min |
| M2 | `sectorKeys.details()` defined but never used | `features/sectors/hooks/sector-query-keys.ts:7` | 5 min |
| M3 | Summary key pattern inconsistent (`['trips', 'summary']` vs `['vehicles-summary']`) | All summary query keys | 30 min |
| M4 | `StatusCount` interface duplicated in `dashboard.types.ts` and `report.types.ts` | 2 type files | 15 min |
| M5 | `dispatch-board.types.ts` defines `COLUMN_GROUPS` runtime constants in a types file | `features/dispatch-board/types/` | 15 min |
| M6 | `notification-type.config.ts` uses triple-mixed naming (kebab + dot + kebab) | `features/notifications/constants/` | 10 min |
| M7 | 5 barrel/index.ts files with zero consumer imports (auth, layout, hooks, utils, store) | Various | 15 min |
| M8 | 6 unused animation exports in `lib/design/animation.ts` | `lib/design/animation.ts` | 10 min |
| M9 | `useContractRevenue` hook + `getContractRevenue` service method — dead | `features/reports/` | 15 min |
| M10 | `useTopClients` hook + `getTopClients` service method — dead | `features/reports/` | 15 min |
| M11 | `useDispatchBoardTrip` hook, `dispatchQueryKeys.trip`, `dispatchBoardService.getTrip()` — dead | `features/dispatch-board/` | 15 min |
| M12 | `useVehicleAssignmentHistory` stubbed with `enabled: false` + TODO | `features/sectors/hooks/` | 10 min |
| M13 | `LocaleArrow` and `LocalizedCity` exported but never imported | `components/shared/` | 10 min |
| M14 | Duplicate `common.network_error` / `errors.network` and `common.unauthorized` / `errors.unauthorized` | Locale files | 15 min |
| M15 | `cities` namespace (4 keys) defined but never used in code | `en.json:831-836` | 10 min |
| M16 | `search` namespace has only 1 key — could merge into `common` | `en.json:849` | 10 min |
| M17 | `data-table-toolbar.tsx` stub always returns null | `components/shared/data-table/` | 10 min |
| M18 | `console.log('[locale] switching to:', newLocale)` in production code | `lib/i18n/locale-context.tsx:41` | 5 min |
| M19 | Mock API calls in forgot-password (1s delay) and reset-password forms | `auth/components/*.tsx` | 15 min |
| M20 | `button.tsx` success variant uses hardcoded `emerald-600/500/700` | `components/ui/button.tsx:16` | 15 min |
| M21 | `useEntityFilters` and related hooks live in `components/shared/hooks/` instead of `src/hooks/` | `components/shared/hooks/` | 15 min |
| M22 | `useUnwrappedResponse` in reports hooks maps response differently than other features | `features/reports/hooks/` | 30 min |
| M23 | `features/sectors/constants/sector-permissions.ts` never imported (uses central `PERMISSIONS` instead) | `sector-permissions.ts` | 10 min |
| M24 | `notes` textarea field duplicated identically across 10 form files | All create/update forms | 1 day |
| M25 | `fromLocation`/`toLocation` route fields duplicated across trips & contracts (4 forms) | Form files | 1 day |
| M26 | Status `<select>` options duplicated across 10 forms — no shared `StatusSelect` component | All forms | 1 day |
| M27 | `unwrapApiResponseWithWarnings()` and `getApiWarnings()` exported but never imported | `lib/api/unwrap.ts` | 10 min |
| M28 | `ag-grid-community` dependency in `package.json` not used anywhere | `package.json` | 5 min |

---

## 4. Low Severity

| ID | Finding | File(s) | Effort |
|----|---------|---------|--------|
| L1 | `useURLParams` uses uppercase `URL` (should be `useUrlParams`) | `hooks/use-url-params.ts` | 5 min |
| L2 | No `isFetching` usage — all loading states use `isLoading` only | All hooks | — |
| L3 | `select` option used only once (`useClientContracts`) | `features/contracts/hooks/` | — |
| L4 | `retry: false` only on trips mutations — inconsistent | `features/trips/hooks/` | 10 min |
| L5 | Unused `onExportExcel`, `onExportPdf` props in `ExportDropdown` | `components/shared/export-dropdown.tsx` | 10 min |
| L6 | `sectors` route missing `error.tsx` | `app/(dashboard)/sectors/` | 15 min |
| L7 | Some `[id]/` routes missing `loading.tsx` (clients, contracts, sectors) | Various app routes | 30 min |
| L8 | `Date` handling uses `.split('T')[0]` pattern duplicated 3 times | `update-trip-form.tsx`, `update-driver-form.tsx`, `update-contract-form.tsx` | 30 min |
| L9 | `language-switcher.tsx` is duplicate of `language-toggle.tsx` — never imported | `components/ui/language-switcher.tsx` | 5 min |
| L10 | `DISPATCH_ROOT` constant in dispatch-board hook duplicates `dispatchQueryKeys.all` | `features/dispatch-board/hooks/` | 10 min |
| L11 | `SectorPermissionKey` type alias exported from dead constants file | `features/sectors/constants/` | 5 min |
| L12 | `PERMISSIONS` object uses both SCREAMING_SNAKE keys and camelCase group keys | `constants/permissions.ts` | 15 min |
| L13 | No data-testid attributes anywhere — impacts future E2E testing | All components | — |

---

## 5. Prioritized Roadmap

### Phase 1 — Quick Wins (Day 1) ~2 hours
| Order | ID | Task | Effort |
|-------|----|------|--------|
| 1 | C1 | Add `validation.contract_active_requirements` to locale files | 15 min |
| 2 | C2 | Fix hardcoded validation messages in `sector-form.tsx` | 30 min |
| 3 | C3 | Fix hardcoded plate role labels in `update-vehicle-form.tsx` | 10 min |
| 4 | H1 | Delete 5 orphaned pagination components (~360 lines) | 10 min |
| 5 | H2 | Delete 5 orphaned filter components (~400 lines) | 10 min |
| 6 | H7 | Delete 2 duplicate data-table files (~458 lines) | 5 min |
| 7 | H18 | Move `sector-query-keys.ts` to constants/ | 10 min |
| 8 | H17 | Move auth forms to `forms/` directory | 15 min |
| 9 | M1 | Add `index.ts` barrel to dashboard | 10 min |
| 10 | M18 | Remove console.log in locale-context.tsx | 5 min |

### Phase 2 — Data Consistency (Day 2) ~3 hours
| Order | ID | Task | Effort |
|-------|----|------|--------|
| 11 | H4 | Fix sub-sector key naming — align on singular/plural, add list invalidation | 30 min |
| 12 | H5 | Add `['sectors-summary']` invalidation to sector mutations | 15 min |
| 13 | H11 | Standardize dashboard query keys to kebab-case | 30 min |
| 14 | H12 | Rename `SectorDetailPage` → `SectorDetailsPage` | 15 min |
| 15 | M3 | Align summary keys to consistent pattern | 30 min |
| 16 | M2 | Remove unused `sectorKeys.details()` | 5 min |
| 17 | M5 | Move `COLUMN_GROUPS` from `.types.ts` to constants file | 15 min |

### Phase 3 — Dead Code Removal (Day 3) ~2 hours
| Order | ID | Task | Effort |
|-------|----|------|--------|
| 18 | M7 | Remove or wire up dead barrel files (auth, layout, hooks, utils, store) | 15 min |
| 19 | M8 | Remove unused animation exports | 10 min |
| 20 | M9-M11 | Remove dead hooks/services for contract revenue, top clients, dispatch-board trip | 30 min |
| 21 | M13 | Remove unused `LocaleArrow` and `LocalizedCity` | 10 min |
| 22 | M17 | Remove or implement `data-table-toolbar.tsx` stub | 10 min |
| 23 | M23 | Remove or wire up `sector-permissions.ts` constants | 10 min |
| 24 | M27 | Remove unused API utility exports | 10 min |
| 25 | M28 | Remove unused `ag-grid-community` dependency | 5 min |
| 26 | L9 | Remove duplicate `language-switcher.tsx` | 5 min |
| 27 | L5 | Clean up unused ExportDropdown props | 10 min |

### Phase 4 — Theming & i18n Hardening (Days 4-5) ~2 days
| Order | ID | Task | Effort |
|-------|----|------|--------|
| 28 | H3 | Replace 79+ hardcoded colors with CSS variables/design tokens | 1-2 days |
| 29 | H6 | Fix `t('common.search') + '...'` concatenation across 8 sites | 30 min |
| 30 | H13 | Deduplicate `common_statuses` / `filters` namespaces | 1 hour |
| 31 | H14,H15 | Standardize search icon usage (lucide-react vs inline SVG) | 30 min |
| 32 | M14 | Merge duplicate `common.*` / `errors.*` keys | 15 min |
| 33 | M15 | Remove unused `cities` namespace keys | 10 min |
| 34 | M16 | Merge `search` namespace into `common` | 10 min |
| 35 | M20 | Fix button success variant to use CSS variables | 15 min |
| 36 | M6 | Rename `notification-type.config.ts` to use consistent pattern | 10 min |

### Phase 5 — Shared Components & Forms (Days 6-7) ~2 days
| Order | ID | Task | Effort |
|-------|----|------|--------|
| 37 | H10 | Refactor sector form to match shared patterns (schema, autoFocus, scrollToError, FieldError) | 1 hour |
| 38 | H16 | Create shared `DashboardErrorBoundary` component, delete 7 duplicates | 30 min |
| 39 | M24 | Extract shared `NotesTextarea` component (10 duplicates) | 1 day |
| 40 | M25 | Extract shared `RouteFields` component for fromLocation/toLocation (4 duplicates) | 1 day |
| 41 | M26 | Create shared `StatusSelectField` component (10 duplicates) | 1 day |
| 42 | M21 | Move cross-feature hooks from `components/shared/hooks/` to `src/hooks/` | 15 min |
| 43 | M4 | Extract shared `StatusCount` type to `types/` | 15 min |
| 44 | L7 | Add `loading.tsx` to missing detail routes | 30 min |
| 45 | L6 | Add `error.tsx` to sectors route | 15 min |

### Phase 6 — Performance (Days 8-9) ~2 days
| Order | ID | Task | Effort |
|-------|----|------|--------|
| 46 | H8 | Strategic `React.memo` on leaf shared components | 1 day |
| 47 | H9 | `next/dynamic` for route-level pages, charts, dispatch board | 1 day |
| 48 | M19 | Remove mock API delays, implement real API calls for auth flows | 1 hour |
| 49 | M22 | Standardize response unwrapping across all hooks | 30 min |
| 50 | M10 | Remove duplicate constant definitions | 10 min |
| 51 | L2,L3,L4 | Minor Query config cleanup | 30 min |

### Phase 7 — Debts & Polish (Day 10) ~1 day
| Order | ID | Task | Effort |
|-------|----|------|--------|
| 52 | H9 | Fix remaining form duplication (change detection utility) | 2 hours |
| 53 | L1 | Rename `useURLParams` → `useUrlParams` | 5 min |
| 54 | L8 | Create shared date formatting helper | 30 min |
| 55 | L11 | Clean up dead type exports | 10 min |
| 56 | L12 | Review PERMISSIONS constant naming | 15 min |

---

## 6. Effort Summary

| Phase | Days | Critical | High | Medium | Low | Total Items |
|-------|------|----------|------|--------|-----|-------------|
| Quick Wins | 1 | 3 | 4 | 3 | 0 | 10 |
| Data Consistency | 1 | 0 | 3 | 4 | 0 | 7 |
| Dead Code | 1 | 0 | 0 | 10 | 2 | 12 |
| Theming & i18n | 2 | 0 | 4 | 5 | 0 | 9 |
| Shared Components | 2 | 0 | 1 | 9 | 2 | 12 |
| Performance | 2 | 0 | 2 | 3 | 0 | 5 |
| Debts & Polish | 1 | 0 | 0 | 1 | 3 | 4 |
| **Total** | **10 days** | **3** | **18** | **28** | **13** | **59** |

---

## 7. Architectural Strengths (Preserve)

- **Feature-based folder structure** is well-conceived — every feature has `components/`, `hooks/`, `services/`, `types/` as base
- **Consistent list/detail/create/edit page patterns** across all 5 entity features
- **Good separation** of UI primitives (`ui/`), shared business components (`shared/`), and layout (`layout/`)
- **Design tokens** in `design-tokens.ts` for layout constants (`SECTION`, `CARD`, `CARD_HEADER`, `CARD_BODY`) — a good foundation
- **CVA-based variants** for Button, Badge, StatusBadge — extensible pattern
- **App Router route groups** (`(auth)` and `(dashboard)`) cleanly separate public vs authenticated sections
- **Consistent hook naming** — all hooks use `use` prefix, PascalCase components, camelCase services
- **Strong Zod + react-hook-form integration** with resolver pattern used across all 15 forms
- **No `I` prefix** on interfaces — follows clean TypeScript conventions
- **No default exports** — consistent named exports everywhere
