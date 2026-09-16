"use client";

import { useState } from "react";
import { catalogueSchema, type Catalogue, type CmsProduct } from "@/lib/cms-schema";

export function CataloguePicker({ onAdd, disabled }: { onAdd: (product: CmsProduct) => void; disabled: boolean }) {
  const [catalogue, setCatalogue] = useState<Catalogue | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/admin/api/catalogue", { cache: "no-store" });
      if (!response.ok) throw new Error("Catalogue unavailable. Try again or enter an item manually.");
      const body = await response.json();
      setCatalogue(catalogueSchema.parse(body.catalogue));
    } catch {
      setError("Catalogue unavailable. Try again or enter an item manually.");
    } finally { setLoading(false); }
  }

  const matches = catalogue?.products.filter((product) => {
    const category = catalogue.categories.find((entry) => entry.slug === product.category);
    return product.published && `${product.name} ${product.brand} ${category?.name ?? ""}`.toLowerCase().includes(query.trim().toLowerCase());
  }) ?? [];

  return (
    <div className="mb-4 space-y-3 border-b border-hair pb-4">
      <button type="button" className="btn-outline" disabled={loading} onClick={load}>
        {loading ? "Loading catalogue…" : catalogue ? "Refresh catalogue" : "Browse catalogue"}
      </button>
      <p className="text-xs text-steel">Add published equipment, then enter the agreed price. Manual items are also supported.</p>
      {error ? <p role="alert" className="text-sm text-ink">{error}</p> : null}
      {catalogue ? <>
        <label className="block text-sm">
          Search catalogue
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} className="mt-1 block w-full min-w-0 border border-hair bg-white px-3 py-2 focus-visible:outline-2 focus-visible:outline-navy" placeholder="Product, brand or category" />
        </label>
        <p className="text-xs text-steel">{matches.length} matching products</p>
        <ul className="max-h-64 overflow-y-auto divide-y divide-hair">
          {matches.map((product) => <li key={product.slug} className="flex items-center gap-3 py-3">
            <div className="min-w-0 flex-1 break-words text-sm"><span className="font-medium">{product.name}</span><span className="block text-xs text-steel">{product.brand} · {product.availability}</span></div>
            <button type="button" className="btn-outline shrink-0" disabled={disabled || loading} aria-label={`Add ${product.name}`} onClick={(event) => { if (event.detail > 1) return; onAdd(product); setNotice(`${product.name} added. Enter its price below.`); }}>Add</button>
          </li>)}
        </ul>
        {!matches.length ? <p className="text-sm text-steel">No published products match. Change your search or add a manual item below.</p> : null}
      </> : null}
      <p aria-live="polite" className="text-sm text-ink-soft">{notice}</p>
      {disabled ? <p className="text-sm text-steel">Maximum 100 items per proforma.</p> : null}
    </div>
  );
}
