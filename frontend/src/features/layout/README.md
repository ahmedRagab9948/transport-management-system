# Layout & navigation

## Architecture

```
DashboardShell
├── SidebarProvider (collapse + mobile drawer state)
├── AppSidebar (desktop, permission-filtered)
├── TopNavbar
│   ├── MobileSidebar (Sheet)
│   ├── AppBreadcrumbs
│   ├── ThemeToggle
│   └── UserMenu
└── <main>{children}</main>
```

## Navigation registry

[`constants/navigation.ts`](../../constants/navigation.ts) defines `NAVIGATION_REGISTRY`:

- Sidebar labels, icons, routes
- Optional `permission` keys (filtered via `useFilteredNavigation`)
- `comingSoon` items render disabled with a badge

## Shared UI

| Component | Path |
|-----------|------|
| PageHeader | `components/shared/page-header.tsx` |
| EmptyState | `components/shared/empty-state.tsx` |
| StatusBadge | `components/shared/status-badge.tsx` |
| LoadingSkeleton | `components/shared/loading-skeleton.tsx` |
| DataTableShell | `components/shared/data-table-shell.tsx` |
| Can | `components/shared/can.tsx` |

## Responsive behavior

- **md+**: Collapsible sidebar (persisted in `localStorage`)
- **&lt;md**: Sidebar hidden; hamburger opens `Sheet` drawer
