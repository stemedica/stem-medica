import Link from "next/link";

export function Pagination({ page, pages, pathname, filters = {} }: { page: number; pages: number; pathname: string; filters?: Record<string, string> }) {
  if (pages < 2) return null;
  const visible = Array.from(new Set([1, page - 1, page, page + 1, pages])).filter(n => n >= 1 && n <= pages).sort((a, b) => a - b);
  function href(next: number) {
    const params = new URLSearchParams(Object.entries(filters).filter(([, value]) => value));
    if (next > 1) params.set("page", String(next));
    return `${pathname}${params.size ? `?${params}` : ""}`;
  }
  return <nav aria-label="Pagination" className="mt-10 flex flex-wrap items-center justify-center gap-4 border-t border-hair pt-6">
    <p className="w-full text-center text-sm text-ink-soft">Page {page} of {pages}</p>
    {page > 1 ? <Link prefetch={false} className="btn-outline min-h-11" href={href(page - 1)} rel="prev">Previous</Link> : null}
    <div className="flex flex-wrap items-center justify-center gap-1">
      {visible.map((number, index) => <span key={number} className="inline-flex items-center gap-1">
        {index > 0 && number - visible[index - 1] > 1 ? <span aria-hidden="true" className="px-1 text-steel">…</span> : null}
        <Link prefetch={false} href={href(number)} aria-label={`Page ${number}`} aria-current={number === page ? "page" : undefined} className="flex min-h-11 min-w-11 items-center justify-center rounded-full border border-hair px-3 text-sm font-medium text-navy hover:bg-navy-tint aria-[current=page]:border-navy aria-[current=page]:bg-navy aria-[current=page]:text-white">{number}</Link>
      </span>)}
    </div>
    {page < pages ? <Link prefetch={false} className="btn-outline min-h-11" href={href(page + 1)} rel="next">Next</Link> : null}
  </nav>;
}
