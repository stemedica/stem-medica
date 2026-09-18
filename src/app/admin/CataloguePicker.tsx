"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cataloguePickerPageSchema, type CataloguePickerPage, type CmsProduct } from "@/lib/cms-schema";

export function CataloguePicker({ onAdd, limitReached, selectedItems }: {
  onAdd: (product: CmsProduct) => void;
  limitReached: boolean;
  selectedItems: Array<{ catalogueSlug?: string; description: string; qty: number }>;
}) {
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<CmsProduct[]>([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const requestRef = useRef<AbortController | null>(null);
  const pageCacheRef = useRef(new Map<string, CataloguePickerPage>());

  const load = useCallback(async (requestedPage: number, requestedQuery: string, refresh = false) => {
    const normalizedQuery = requestedQuery.trim().toLocaleLowerCase();
    const cacheKey = `${normalizedQuery}\n${requestedPage}`;
    const apply = (result: CataloguePickerPage) => {
      setProducts(result.products);
      setPage(result.page);
      setPages(result.pages);
      setTotal(result.total);
    };
    const cached = refresh ? undefined : pageCacheRef.current.get(cacheKey);
    if (cached) {
      requestRef.current?.abort();
      apply(cached);
      setError("");
      setLoading(false);
      return;
    }
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ view: "picker", page: String(requestedPage) });
      if (requestedQuery.trim()) params.set("q", requestedQuery.trim());
      const response = await fetch(`/admin/api/catalogue?${params}`, { cache: "no-store", signal: controller.signal });
      if (!response.ok) throw new Error("Catalogue unavailable. Try again or enter an item manually.");
      const result = cataloguePickerPageSchema.parse(await response.json());
      pageCacheRef.current.set(`${normalizedQuery}\n${result.page}`, result);
      apply(result);
    } catch (cause) {
      if (cause instanceof DOMException && cause.name === "AbortError") return;
      setError("Catalogue unavailable. Try again or enter an item manually.");
    } finally {
      if (requestRef.current === controller) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => void load(1, query), 200);
    return () => window.clearTimeout(timer);
  }, [load, open, query]);

  useEffect(() => () => requestRef.current?.abort(), []);

  return (
    <div className="mb-4 space-y-3 border-b border-hair pb-4">
      <button type="button" className="btn-outline" disabled={loading} onClick={() => {
        if (!open) return setOpen(true);
        pageCacheRef.current.clear();
        void load(page, query, true);
      }}>
        {loading && !products.length ? "Loading catalogue…" : open ? "Refresh catalogue" : "Browse catalogue"}
      </button>
      <p className="text-xs text-steel">Add published equipment, then enter the agreed price. Manual items are also supported.</p>
      {error ? <p role="alert" className="text-sm text-ink">{error}</p> : null}
      {open ? <>
        <label className="block text-sm">
          Search catalogue
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} className="mt-1 block w-full min-w-0 border border-hair bg-white px-3 py-2 focus-visible:outline-2 focus-visible:outline-navy" placeholder="Product, brand or category" />
        </label>
        <p aria-live="polite" className="min-h-4 text-xs text-steel">
          {loading
            ? "Updating results…"
            : `Showing ${products.length} of ${total} ${query.trim() ? "matching" : "published"} product${total === 1 ? "" : "s"} · Page ${page} of ${pages}`}
        </p>
        <ul className="divide-y divide-hair" aria-busy={loading}>
          {products.map((product) => {
            const generatedDescription = `${product.name} — ${product.brand}`;
            const selectedQuantity = selectedItems.find((item) => item.catalogueSlug === product.slug
              || (!item.catalogueSlug && item.description.trim() === generatedDescription))?.qty ?? 0;
            const quantityLimitReached = selectedQuantity >= 1_000_000;
            return <li key={product.slug} className="flex items-center gap-3 py-3">
              <div className="min-w-0 flex-1 break-words text-sm"><span className="font-medium">{product.name}</span><span className="block text-xs text-steel">{product.brand} · {product.availability}</span></div>
              <button type="button" className="btn-outline shrink-0" disabled={loading || quantityLimitReached || (limitReached && !selectedQuantity)} aria-label={`Add ${product.name}`} onClick={(event) => {
                if (event.detail > 1) return;
                onAdd(product);
                setNotice(selectedQuantity
                  ? `${product.name} quantity increased to ${selectedQuantity + 1}.`
                  : `${product.name} added. Enter its price below.`);
              }}>{selectedQuantity ? "Add one" : "Add"}</button>
            </li>;
          })}
        </ul>
        {!loading && !products.length && !error ? <p className="text-sm text-steel">No published products match. Change your search or add a manual item below.</p> : null}
        {!error && total > 0 ? (
          <nav aria-label="Catalogue pages" className="flex items-center justify-between gap-3 border-t border-hair pt-3">
            <button type="button" className="btn-outline min-h-11" disabled={loading || page <= 1} onClick={() => void load(page - 1, query)}>Previous</button>
            <span className="text-xs text-steel">Page {page} of {pages}</span>
            <button type="button" className="btn-outline min-h-11" disabled={loading || page >= pages} onClick={() => void load(page + 1, query)}>Next</button>
          </nav>
        ) : null}
      </> : null}
      <p aria-live="polite" className="text-sm text-ink-soft">{notice}</p>
      {limitReached ? <p className="text-sm text-steel">Maximum 100 rows reached. You can still increase quantities for products already included.</p> : null}
    </div>
  );
}
