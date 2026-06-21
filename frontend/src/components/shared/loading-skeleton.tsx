import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface LoadingSkeletonProps {
  variant?: 'page' | 'table' | 'cards' | 'form' | 'details';
  className?: string;
}

export function LoadingSkeleton({ variant = 'page', className }: LoadingSkeletonProps) {
  if (variant === 'table') {
    return (
      <div className={cn('space-y-3', className)}>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-9 w-32" />
        </div>
        <Skeleton className="h-10 w-full rounded-lg" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (variant === 'cards') {
    return (
      <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-3 rounded-lg border border-border p-5">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'form') {
    return (
      <div className={cn('max-w-2xl space-y-6', className)}>
        <div className="space-y-4 rounded-lg border border-border bg-card p-5">
          <Skeleton className="h-5 w-32" />
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Skeleton className="h-10 w-24 rounded-md" />
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>
      </div>
    );
  }

  if (variant === 'details') {
    return (
      <div className={cn('flex flex-1 flex-col gap-6', className)}>
        <div className="flex items-start gap-3">
          <Skeleton className="size-9 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-5">
            <Skeleton className="mb-4 h-4 w-32" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="space-y-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <LoadingSkeleton variant="cards" />
    </div>
  );
}
