import { Skeleton } from '@/components/ui/skeleton';

export default function TripDetailsLoading() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
      <div className="flex items-start gap-3">
        <Skeleton className="size-9 rounded-md" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <div className="space-y-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-6">
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
    </div>
  );
}
