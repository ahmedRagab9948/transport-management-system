/**
 * Enterprise Design Tokens
 *
 * This module is the single source of truth for all design values.
 * It mirrors the CSS custom properties defined in globals.css.
 * Use these tokens for programmatic access, documentation, and type safety.
 *
 * When updating tokens, keep in sync with:
 *   - frontend/src/app/globals.css  (@theme inline block and :root/.dark)
 *   - shadcn/tailwind.css           (base theme)
 */

/* ------------------------------------------------------------------ */
/*  Colors                                                             */
/* ------------------------------------------------------------------ */

/** Surface colors */
export const colorBackground = 'var(--background)';
export const colorSurface = 'var(--surface)';
export const colorForeground = 'var(--foreground)';
export const colorCard = 'var(--card)';
export const colorCardForeground = 'var(--card-foreground)';
export const colorPopover = 'var(--popover)';
export const colorPopoverForeground = 'var(--popover-foreground)';

/** Brand */
export const colorPrimary = 'var(--primary)';
export const colorPrimaryForeground = 'var(--primary-foreground)';
export const colorPrimaryHover = 'var(--primary-hover)';

/** Surface variants */
export const colorSecondary = 'var(--secondary)';
export const colorSecondaryForeground = 'var(--secondary-foreground)';
export const colorMuted = 'var(--muted)';
export const colorMutedForeground = 'var(--muted-foreground)';
export const colorAccent = 'var(--accent)';
export const colorAccentForeground = 'var(--accent-foreground)';

/** Semantic */
export const colorDestructive = 'var(--destructive)';
export const colorDestructiveForeground = 'var(--destructive-foreground)';
export const colorSuccess = 'var(--success)';
export const colorWarning = 'var(--warning)';

/** Borders & Inputs */
export const colorBorder = 'var(--border)';
export const colorInput = 'var(--input)';
export const colorRing = 'var(--ring)';

/** Charts */
export const colorChart1 = 'var(--chart-1)';
export const colorChart2 = 'var(--chart-2)';
export const colorChart3 = 'var(--chart-3)';
export const colorChart4 = 'var(--chart-4)';
export const colorChart5 = 'var(--chart-5)';

/** Sidebar */
export const colorSidebar = 'var(--sidebar)';
export const colorSidebarForeground = 'var(--sidebar-foreground)';
export const colorSidebarPrimary = 'var(--sidebar-primary)';
export const colorSidebarPrimaryForeground = 'var(--sidebar-primary-foreground)';
export const colorSidebarAccent = 'var(--sidebar-accent)';
export const colorSidebarAccentForeground = 'var(--sidebar-accent-foreground)';
export const colorSidebarBorder = 'var(--sidebar-border)';
export const colorSidebarRing = 'var(--sidebar-ring)';

/** KPI accent colors (applied via .kpi-* utility classes) */
export const kpiColors = {
  blue: { bg: 'var(--kpi-bg)', icon: 'var(--kpi-icon)' },
  cyan: { bg: 'var(--kpi-bg)', icon: 'var(--kpi-icon)' },
  emerald: { bg: 'var(--kpi-bg)', icon: 'var(--kpi-icon)' },
  amber: { bg: 'var(--kpi-bg)', icon: 'var(--kpi-icon)' },
  purple: { bg: 'var(--kpi-bg)', icon: 'var(--kpi-icon)' },
  rose: { bg: 'var(--kpi-bg)', icon: 'var(--kpi-icon)' },
} as const;

/** Light-mode hex values (reference only — use CSS variables at runtime) */
export const colorHexLight = {
  background: '#F9FAFB',
  surface: '#FFFFFF',
  foreground: '#111827',
  primary: '#1E40AF',
  primaryHover: '#1E3A8A',
  destructive: '#EF4444',
  success: '#16A34A',
  warning: '#F59E0B',
  border: '#E5E7EB',
} as const;

export type ColorHexLight = keyof typeof colorHexLight;

/** Dark-mode hex values (reference only) */
export const colorHexDark = {
  background: '#0F172A',
  surface: '#1E293B',
  foreground: '#F8FAFC',
  primary: '#3B82F6',
  primaryHover: '#2563EB',
  destructive: '#EF4444',
  success: '#22C55E',
  warning: '#F59E0B',
  border: '#334155',
} as const;

export type ColorHexDark = keyof typeof colorHexDark;

/* ------------------------------------------------------------------ */
/*  Typography                                                         */
/* ------------------------------------------------------------------ */

export const fontFamily = {
  sans: 'var(--font-inter), system-ui, sans-serif',
  arabic: 'var(--font-cairo), system-ui, sans-serif',
  mono: 'var(--font-geist-mono)',
} as const;

export const fontSize = {
  display: '48px',
  h1: '32px',
  h2: '28px',
  h3: '24px',
  h4: '20px',
  bodyLg: '18px',
  body: '16px',
  sm: '14px',
  xs: '12px',
} as const;

export const fontWeight = {
  display: 700,
  h1: 700,
  h2: 700,
  h3: 600,
  h4: 600,
  bodyLg: 400,
  body: 400,
  sm: 400,
  xs: 400,
  semibold: 600,
  bold: 700,
} as const;

export const lineHeight = {
  display: 1.1,
  h1: 1.2,
  h2: 1.3,
  h3: 1.35,
  h4: 1.4,
  bodyLg: 1.6,
  body: 1.6,
  sm: 1.5,
  xs: 1.4,
} as const;

/** Typography scale presets matching Tailwind theme tokens */
export const typography = {
  display: { size: fontSize.display, weight: fontWeight.display, lineHeight: lineHeight.display },
  h1: { size: fontSize.h1, weight: fontWeight.h1, lineHeight: lineHeight.h1 },
  h2: { size: fontSize.h2, weight: fontWeight.h2, lineHeight: lineHeight.h2 },
  h3: { size: fontSize.h3, weight: fontWeight.h3, lineHeight: lineHeight.h3 },
  h4: { size: fontSize.h4, weight: fontWeight.h4, lineHeight: lineHeight.h4 },
  bodyLg: { size: fontSize.bodyLg, weight: fontWeight.bodyLg, lineHeight: lineHeight.bodyLg },
  body: { size: fontSize.body, weight: fontWeight.body, lineHeight: lineHeight.body },
  sm: { size: fontSize.sm, weight: fontWeight.sm, lineHeight: lineHeight.sm },
  xs: { size: fontSize.xs, weight: fontWeight.xs, lineHeight: lineHeight.xs },
} as const;

/* ------------------------------------------------------------------ */
/*  Spacing  (4px base grid)                                          */
/* ------------------------------------------------------------------ */

export const spacing = {
  0: '0px',
  0.5: '2px',
  1: '4px',
  1.5: '6px',
  2: '8px',
  2.5: '10px',
  3: '12px',
  3.5: '14px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  11: '44px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
  28: '112px',
  32: '128px',
  36: '144px',
  40: '160px',
  44: '176px',
  48: '192px',
  52: '208px',
  56: '224px',
  60: '240px',
  64: '256px',
  72: '288px',
  80: '320px',
  96: '384px',
} as const;

/* ------------------------------------------------------------------ */
/*  Border Radius                                                      */
/* ------------------------------------------------------------------ */

export const borderRadius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  pill: '9999px',
} as const;

/* ------------------------------------------------------------------ */
/*  Shadows                                                            */
/* ------------------------------------------------------------------ */

export const shadow = {
  sm: '0 1px 2px rgba(15, 23, 42, 0.04)',
  md: '0 4px 6px rgba(15, 23, 42, 0.04), 0 2px 4px rgba(15, 23, 42, 0.02)',
} as const;

/* ------------------------------------------------------------------ */
/*  Transition Durations (alias from animation.ts for convenience)     */
/* ------------------------------------------------------------------ */

export { DURATIONS as transitionDuration } from './animation';
