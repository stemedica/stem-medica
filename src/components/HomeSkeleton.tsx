function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`skeleton-block rounded-lg ${className}`} />;
}

function ProductCardSkeleton() {
  return (
    <div className="w-[86%] shrink-0 overflow-hidden rounded-2xl border border-hair bg-white sm:w-auto">
      <SkeletonBlock className="aspect-[4/3] rounded-none border-b border-hair" />
      <div className="p-4 sm:p-5">
        <SkeletonBlock className="h-3 w-20" />
        <SkeletonBlock className="mt-3 h-6 w-4/5" />
        <SkeletonBlock className="mt-3 h-4 w-full" />
        <SkeletonBlock className="mt-2 h-4 w-2/3" />
        <SkeletonBlock className="mt-7 h-4 w-28" />
      </div>
    </div>
  );
}

/** Lightweight server fallback that preserves the equipment section's layout. */
export function HomeEquipmentSkeleton() {
  return (
    <section
      aria-busy="true"
      aria-label="Loading equipment"
      className="border-b border-hair bg-white px-4 py-10 sm:px-6 sm:py-14 lg:py-20"
    >
      <div className="mx-auto max-w-6xl">
        <div aria-hidden="true">
          <header className="flex flex-wrap items-end justify-between gap-5">
            <div className="w-full max-w-2xl">
              <SkeletonBlock className="h-10 w-3/4 sm:h-14 sm:w-2/3" />
              <SkeletonBlock className="mt-5 h-4 w-full max-w-xl" />
              <SkeletonBlock className="mt-2 h-4 w-4/5 max-w-lg" />
            </div>
            <SkeletonBlock className="h-5 w-40" />
          </header>

          <div className="mt-7 flex gap-2 overflow-hidden py-2 sm:mt-8">
            {["w-28", "w-36", "w-32", "w-40"].map((width) => (
              <SkeletonBlock key={width} className={`h-11 shrink-0 rounded-full ${width}`} />
            ))}
          </div>
          <SkeletonBlock className="mt-3 h-3 w-48" />

          <div className="mt-5 flex gap-3 overflow-hidden p-1 pb-3 sm:grid sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {[0, 1, 2].map((index) => <ProductCardSkeleton key={index} />)}
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-hair pt-5">
            <SkeletonBlock className="h-4 w-full max-w-sm" />
            <SkeletonBlock className="h-12 w-44 rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
}

/** Mirrors the optional updates rail without hydrating a temporary component. */
export function HomeUpdatesSkeleton() {
  return (
    <section
      aria-busy="true"
      aria-label="Loading latest updates"
      className="mx-auto max-w-6xl px-5 pb-14 lg:pb-20"
    >
      <div aria-hidden="true">
        <SkeletonBlock className="h-9 w-4/5 max-w-xl sm:h-10" />
        <SkeletonBlock className="mt-4 h-4 w-full max-w-lg" />
        <div className="mt-9 flex gap-4 overflow-hidden md:grid md:grid-cols-2">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className={`w-[86%] shrink-0 rounded-2xl border border-hair bg-white p-5 md:w-auto ${index === 0 ? "md:col-span-2" : ""}`}
            >
              <SkeletonBlock className="aspect-video w-full" />
              <div className="mt-4 flex justify-between gap-4">
                <SkeletonBlock className="h-5 w-24 rounded-full" />
                <SkeletonBlock className="h-3 w-20" />
              </div>
              <SkeletonBlock className="mt-5 h-6 w-3/4" />
              <SkeletonBlock className="mt-3 h-4 w-full" />
              <SkeletonBlock className="mt-2 h-4 w-2/3" />
              <SkeletonBlock className="mt-6 h-4 w-20" />
            </div>
          ))}
        </div>
        <SkeletonBlock className="mt-7 h-12 w-44 rounded-full" />
      </div>
    </section>
  );
}
