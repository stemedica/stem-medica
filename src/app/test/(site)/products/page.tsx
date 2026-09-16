import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { Pagination } from "@/components/Pagination";
import { getCatalogue } from "@/lib/catalogue";
import { paginate } from "@/lib/pagination";
import { MobileCardRail } from "@/components/MobileCardRail";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";

export const metadata: Metadata = {
  title: "Products",
  description: "Medical equipment catalogue. Systems supplied, installed and supported across Ethiopia.",
};

export default async function ProductsPage({ searchParams }: {
  searchParams: Promise<{ cat?: string | string[]; q?: string | string[]; page?: string | string[] }>;
}) {
  const params = await searchParams;
  const { products, categories } = await getCatalogue();
  const requestedCategory = typeof params.cat === "string" ? params.cat : "";
  const category = categories.find((c) => c.slug === requestedCategory);
  const missingCategory = Boolean(requestedCategory && !category);
  const query = typeof params.q === "string" ? params.q.trim().slice(0, 200) : "";
  const filtered = products.filter((p) => !missingCategory &&
    (!category || p.category === category.slug) &&
    `${p.name} ${p.brand} ${p.origin} ${p.summary}`.toLowerCase().includes(query.toLowerCase())
  );
  const result = paginate(filtered, params.page, 10);
  return <div className="mx-auto max-w-6xl px-5 py-8 sm:py-14">
    <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-2 text-sm text-steel">
      <Link href="/test" className="inline-flex min-h-11 items-center text-navy underline underline-offset-4">Home</Link><span aria-hidden="true">/</span>
      {requestedCategory ? <><Link href="/test/products" className="inline-flex min-h-11 items-center text-navy underline underline-offset-4">All equipment</Link><span aria-hidden="true">/</span><span aria-current="page">{category?.name ?? "Unavailable category"}</span></> : <span aria-current="page">All equipment</span>}
    </nav>
    <header className={`grid items-center gap-5 ${category?.image ? "sm:grid-cols-[1fr_240px]" : "max-w-3xl"}`}>
      <div>
      <p className="label text-navy">Equipment catalogue</p>
      <h1 className="font-display mt-3 text-3xl font-semibold leading-tight tracking-tight text-navy sm:text-5xl">{category?.name ?? (missingCategory ? "Category unavailable" : "All equipment")}</h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-ink-soft">{category?.blurb || "Find equipment for your facility. Ask our team to confirm specifications, availability and delivery."}</p>
      </div>
      {category?.image ? <ImagePlaceholder src={category.image} label={category.name} ratio="4/3" className="max-h-48 rounded-2xl border border-hair bg-white" /> : null}
    </header>
    <form action="/test/products" role="search" aria-label="Find equipment" className="mt-5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(160px,240px)_auto]">
      <label className="col-span-2 min-w-0 sm:col-span-1"><span className="sr-only">Search equipment</span>
        <input key={query} type="search" name="q" defaultValue={query} maxLength={200} placeholder="Search equipment" className="h-11 w-full rounded-xl border border-hair bg-white px-3 py-2" />
      </label>
      <label className="min-w-0"><span className="sr-only">Category</span>
        <select key={requestedCategory} name="cat" defaultValue={requestedCategory} className="h-11 w-full min-w-0 truncate rounded-xl border border-hair bg-white px-3 py-2">
          <option value="">All categories</option>
          {missingCategory ? <option value={requestedCategory}>Unavailable category</option> : null}
          {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
      </label>
      <button type="submit" className="min-h-11 rounded-xl bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-deep">Search</button>
    </form>
    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
      <p className="text-sm text-ink-soft">{filtered.length} {filtered.length === 1 ? "product" : "products"}{query ? ` matching “${query}”` : category ? ` in ${category.name}` : ""}</p>
      {query || requestedCategory ? <Link href="/test/products" className="inline-flex min-h-11 items-center text-sm font-medium text-navy underline underline-offset-4">Clear filters</Link> : null}
    </div>
    {!filtered.length ? <div className="mt-5 rounded-2xl border border-hair bg-white p-6 sm:p-8">
      <h2 className="text-xl font-semibold text-navy">{missingCategory ? "This category is no longer available" : query ? "No matching equipment" : category ? "No equipment listed yet" : "Our catalogue is being updated"}</h2>
      <p className="mt-3 max-w-xl leading-relaxed text-ink-soft">{missingCategory ? "Choose another category to browse available listings." : query ? "Try a shorter search or clear your filters to see available listings." : category ? "This category has no published products yet. Browse another category or check back later." : "There are no published products yet. Please check back later."}</p>
      <div className="mt-5 flex flex-wrap gap-3">{category && query ? <Link href={`/test/products?cat=${encodeURIComponent(category.slug)}`} className="btn-outline min-h-11">Clear search</Link> : null}{requestedCategory || query ? <Link href="/test/products" className="btn-primary min-h-11">Browse all equipment</Link> : <Link href="/test" className="btn-outline min-h-11">Back to home</Link>}</div>
    </div> : <div className="mt-5"><MobileCardRail key={`${requestedCategory}-${query}-${result.page}`} label="Catalogue products">{result.items.map((p, i) => <ProductCard key={p.slug} product={p} index={(result.page - 1) * 10 + i} />)}</MobileCardRail></div>}
    <Pagination page={result.page} pages={result.pages} pathname="/test/products" filters={{ cat: requestedCategory, q: query }} />
  </div>;
}
