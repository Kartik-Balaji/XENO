export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-zinc-800 animate-pulse rounded-md ${className}`} />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-[#18181b] border border-zinc-800 rounded-md p-4 space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

export function PlayResultSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-5 w-1/4" />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}
