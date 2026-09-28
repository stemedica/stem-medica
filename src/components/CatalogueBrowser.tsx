"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search, X } from "lucide-react";
import { ProductCard } from "./ProductCard";
import type { CatalogueItem, CmsCategory } from "@/lib/cms-schema";

const PAGE = 12;

/**
 * Browsing happens in the page.
 *
 * The catalogue is small enough to hold in memory, so typing filters what is
 * already here instead of waiting on a round trip — on the connections this
 * site is used over, a form submit per keystroke-worth of thought was the
 * slowest part of finding anything.
 *
 * The address bar still follows along, so a filtered view stays shareable and
 * the back button behaves, but it is updated without navigating.
 */
export function CatalogueBrowser({ products, categories, initialQuery, initialCategory }: {
  products: CatalogueItem[];
  categories: CmsCategory[];
  initialQuery: string;
  initialCategory: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  // How many are shown, tagged with the filters they belong to. Derived rather
  // than reset in an effect, which would render twice on every keystroke.
  const [page, setPage] = useState({ signature: `${initialQuery}|${initialCategory}`, count: PAGE });
  // Keeps typing responsive: the input updates immediately, the list catches up.
  const deferred = useDeferredValue(query);
  const first = useRef(true);

  const haystacks = useMemo(
    () => products.map((product) => `${product.name} ${product.brand} ${product.origin} ${product.summary}`.toLowerCase()),
    [products],
  );

  const matches = useMemo(() => {
    const needle = deferred.trim().toLowerCase();
    return products.filter((product, index) =>
      (!category || product.category === category)
      && (!needle || haystacks[index].includes(needle)));
  }, [products, haystacks, deferred, category]);

  // Reflect the filters in the URL without a navigation, so the view can be
  // shared or reloaded. Skipped on mount so we never rewrite what we arrived on.
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (category) params.set("cat", category);
    const search = params.toString();
    window.history.replaceState(null, "", search ? `/products?${search}` : "/products");
  }, [query, category]);

  const signature = `${deferred}|${category}`;
  const shown = page.signature === signature ? page.count : PAGE;
  const activeCategory = categories.find((item) => item.slug === category);
  const visible = matches.slice(0, shown);
  const field = "h-12 w-full min-w-0 rounded-xl border border-hair bg-white px-4 text-base outline-none transition-colors focus:border-navy";

  return (
    <>
      <div className="mt-6 grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(180px,260px)]">
        <label className="relative block min-w-0">
          <span className="sr-only">Search equipment</span>
          <Search size={18} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-steel" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value.slice(0, 200))}
            placeholder="Search equipment, brand or origin"
            className={`${field} pl-11 pr-11`}
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-steel transition-colors hover:bg-paper hover:text-navy"
            >
              <X size={17} aria-hidden="true" />
            </button>
          ) : null}
        </label>

        <label className="relative block min-w-0">
          <span className="sr-only">Category</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)} className={`site-select ${field} appearance-none truncate pr-11`}>
            <option value="">All categories</option>
            {categories.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
          </select>
          <svg aria-hidden="true" viewBox="0 0 20 20" className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-navy">
            <path d="M6 8l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p role="status" aria-live="polite" aria-atomic="true" className="text-sm text-ink-soft">
          {matches.length} {matches.length === 1 ? "product" : "products"}
          {query.trim() ? ` matching “${query.trim()}”` : activeCategory ? ` in ${activeCategory.name}` : ""}
        </p>
        {query.trim() || category ? (
          <button type="button" onClick={() => { setQuery(""); setCategory(""); }} className="inline-flex min-h-11 items-center text-sm font-medium text-navy underline underline-offset-4">
            Clear filters
          </button>
        ) : null}
      </div>

      {matches.length ? (
        <>
          <section aria-label="Equipment results" className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((product, index) => (
              <ProductCard
                key={product.slug}
                product={product}
                index={index}
                categoryName={categories.find((item) => item.slug === product.category)?.name ?? ""}
              />
            ))}
          </section>
          {shown < matches.length ? (
            <div className="mt-8 flex justify-center">
              <button type="button" onClick={() => setPage({ signature, count: shown + PAGE })} className="btn-outline min-h-12 px-7">
                Show more ({matches.length - shown} left)
              </button>
            </div>
          ) : null}
        </>
      ) : null}

      <aside className="mt-14 flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-hair bg-paper p-6 sm:p-8">
        <div>
          {matches.length ? (
            <>
              <h2 className="font-display text-xl font-semibold text-navy">Need several items?</h2>
              <p className="mt-2 max-w-[56ch] text-base leading-relaxed text-ink-soft">
                Send your equipment list with quantities and we will come back with pricing and delivery time.
              </p>
            </>
          ) : (
            <>
              <h2 className="font-display text-xl font-semibold text-navy">Nothing matches that</h2>
              <p className="mt-2 max-w-[56ch] text-base leading-relaxed text-ink-soft">
                Try fewer words or clear the filters. If we do not list it, we can still source it.
              </p>
            </>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href={query.trim() ? `/quote?equipment=${encodeURIComponent(query.trim())}` : "/quote"}
            className="inline-flex min-h-12 shrink-0 items-center gap-3 rounded-full bg-scarlet px-6 text-sm font-semibold text-white transition-colors hover:bg-vital"
          >
            Request a quote <ArrowRight size={17} aria-hidden="true" />
          </Link>
          {!matches.length && (query.trim() || category) ? (
            <button
              type="button"
              onClick={() => { setQuery(""); setCategory(""); }}
              className="btn-outline min-h-12"
            >
              Clear filters
            </button>
          ) : null}
        </div>
      </aside>
    </>
  );
}
