/** Prerender-safe loading skeleton shown while the shop page hydrates. */
export function ShopSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="h-4 w-32 animate-pulse rounded bg-muted" />
      <div className="mt-3 h-8 w-64 animate-pulse rounded bg-muted" />
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-border bg-white"
          >
            <div className="aspect-square animate-pulse bg-muted" />
            <div className="space-y-2.5 p-4">
              <div className="h-3 w-20 animate-pulse rounded bg-muted" />
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
              <div className="h-6 w-24 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
