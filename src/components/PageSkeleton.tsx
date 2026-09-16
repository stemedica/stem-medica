import React from "react";

function Block({ className = "" }: { className?: string }) {
  return <div className={`skeleton-block rounded-lg ${className}`} />;
}
function Lines() {
  return <div className="space-y-3"><Block className="h-4 w-full" /><Block className="h-4 w-5/6" /><Block className="h-4 w-2/3" /></div>;
}

/** Server-rendered placeholders: no timers, data requests or artificial delay. */
export function PageSkeleton({ variant = "page", label = "Loading page…" }: {
  variant?: "page" | "catalogue" | "product" | "blog" | "article" | "admin";
  label?: string;
}) {
  const listing = variant === "catalogue" || variant === "blog";
  const article = variant === "article";
  return <div className="mx-auto min-h-[65vh] max-w-6xl px-5 py-8 sm:px-8 sm:py-14" data-loading-skeleton={variant}>
    <p role="status" className="mb-6 text-sm text-ink-soft">{label}</p>
    <div aria-hidden="true" className={article ? "mx-auto max-w-3xl" : ""}>
      <Block className="mb-5 h-4 w-36" />
      <Block className="h-10 w-4/5 max-w-xl sm:h-14" />
      <div className="mt-6 max-w-2xl"><Lines /></div>
      {listing ? <>
        <div className="my-8 grid gap-3 sm:grid-cols-[1fr_1fr_120px]"><Block className="h-12" /><Block className="h-12" /><Block className="h-12" /></div>
        <div className={`grid gap-5 ${variant === "catalogue" ? "sm:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-2"}`}>
          {Array.from({ length: variant === "catalogue" ? 6 : 3 }, (_, index) => <div key={index} className={`rounded-2xl border border-hair bg-white p-6 ${variant === "blog" && index === 0 ? "md:col-span-2" : ""}`}>
            <Block className="mb-5 h-6 w-28" /><Block className="mb-6 h-7 w-4/5" /><Lines /><Block className="mt-8 h-4 w-32" />
          </div>)}
        </div>
      </> : variant === "product" ? <div className="mt-10 grid gap-8 md:grid-cols-2"><Block className="aspect-[4/3]" /><div className="space-y-8"><Lines /><Lines /><Block className="h-12 w-48" /></div></div>
      : variant === "admin" ? <div className="mt-8 grid gap-5 md:grid-cols-3">{[0, 1, 2].map(index => <div key={index} className="rounded-xl border border-hair bg-white p-6"><Block className="mb-6 h-8 w-1/2" /><Lines /></div>)}</div>
      : <div className="mt-10 space-y-8"><Block className={article ? "h-7 w-2/3" : "h-48 w-full sm:h-64"} /><Lines /><Lines /><Lines /></div>}
    </div>
  </div>;
}
