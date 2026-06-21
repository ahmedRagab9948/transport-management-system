export const CARD = {
  base: 'rounded-2xl',
  surface: 'border border-border/50 bg-card/80 backdrop-blur-md shadow-sm',
  interactive: 'border border-border/50 bg-card/80 backdrop-blur-md shadow-sm hover:-translate-y-1 hover:shadow-xl cursor-pointer',
  floating: 'border border-primary/20 bg-card shadow-2xl',
} as const;

export const SECTION = {
  wrapper: 'flex flex-1 flex-col gap-3 sm:gap-4 lg:gap-6 p-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto',
  grid: 'grid gap-4 sm:gap-6',
  grid2: 'grid gap-4 sm:gap-6 lg:grid-cols-2',
} as const;

export const CARD_HEADER = 'flex items-center gap-2 border-b border-border/40 px-6 py-4';
export const CARD_BODY = 'p-6';
