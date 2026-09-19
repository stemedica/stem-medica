import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { Pagination } from "@/components/Pagination";
import { getCatalogue } from "@/lib/catalogue";
import { paginate } from "@/lib/pagination";
import { MobileCardRail } from "@/components/MobileCardRail";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";

export const metadata: Metadata = {
  alternates: { canonical: "/products" },
  title: "Products",
  description: "Medical equipment, supplies and devices for hospitals, clinics and laboratories across Ethiopia.",
};

const productFamilies = [
  "Monitoring equipment",
  "Emergency equipment",
  "Diagnostic equipment",
  "Surgical equipment",
  "Medical furniture",
  "Orthopedic products",
  "Dental equipment",
  "Medical imaging",
  "Laboratory equipment",
  "Wound care products",
];

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
      <Link href="/" className="inline-flex min-h-11 items-center text-navy underline underline-offset-4">Home</Link><span aria-hidden="true">/</span>
      {requestedCategory ? <><Link href="/products" className="inline-flex min-h-11 items-center text-navy underline underline-offset-4">All equipment</Link><span aria-hidden="true">/</span><span aria-current="page">{category?.name ?? "Unavailable category"}</span></> : <span aria-current="page">All equipment</span>}
    </nav>
    <header className={`grid items-center gap-5 ${category?.image ? "sm:grid-cols-[1fr_240px]" : "max-w-3xl"}`}>
      <div>
      <h1 className="font-display max-w-[22ch] text-3xl font-semibold leading-tight tracking-[-0.025em] text-balance text-navy sm:text-5xl">{category?.name ?? (missingCategory ? "Category unavailable" : "All equipment")}</h1>
      <p className="mt-4 max-w-[65ch] text-base leading-relaxed text-ink-soft">{category?.blurb || "Browse quality medical supplies, devices and equipment for health facilities across Ethiopia. Contact us to confirm the model, price and delivery time."}</p>
      </div>
      {category?.image ? <ImagePlaceholder src={category.image} label={category.name} ratio="4/3" className="max-h-48 rounded-2xl border border-hair bg-white" /> : null}
    </header>
    {!requestedCategory && !query ? <section aria-labelledby="product-families" className="mt-8 border-y border-hair py-6">
      <h2 id="product-families" className="label text-steel">What we supply</h2>
      <ul className="mt-4 grid gap-x-8 gap-y-3 text-sm font-medium text-navy sm:grid-cols-2 lg:grid-cols-3">
        {productFamilies.map((family, index) => <li key={family} className="flex items-baseline gap-3">
          <span className="font-mono text-xs tabular-nums text-scarlet">{String(index + 1).padStart(2, "0")}</span>
          {family}
        </li>)}
      </ul>
    </section> : null}
    <form action="/products" role="search" aria-label="Find equipment" className="mt-5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(160px,240px)_auto]">
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
      {query || requestedCategory ? <Link href="/products" className="inline-flex min-h-11 items-center text-sm font-medium text-navy underline underline-offset-4">Clear filters</Link> : null}
    </div>
    {!filtered.length ? <div className="mt-5 rounded-2xl border border-hair bg-white p-6 sm:p-8">
      <h2 className="text-xl font-semibold text-navy">{missingCategory ? "This category is no longer available" : query ? "No matching equipment" : category ? "No equipment listed yet" : "Our catalogue is being updated"}</h2>
      <p className="mt-3 max-w-[62ch] text-base leading-relaxed text-ink-soft">{missingCategory ? "Choose another category to see available equipment." : query ? "Try fewer words or clear the filters to see all equipment." : category ? "There is no equipment listed in this category yet. Try another category or check back later." : "We are adding equipment now. Please check back soon or contact us for help."}</p>
      <div className="action-stack mt-5">{category && query ? <Link href={`/products?cat=${encodeURIComponent(category.slug)}`} className="btn-outline min-h-11">Clear search</Link> : null}{requestedCategory || query ? <Link href="/products" className="btn-primary min-h-11">Browse all equipment</Link> : <Link href="/" className="btn-outline min-h-11">Back to home</Link>}</div>
    </div> : <section aria-labelledby="catalogue-results" className="mt-5"><h2 id="catalogue-results" className="sr-only">Equipment results</h2><MobileCardRail key={`${requestedCategory}-${query}-${result.page}`} label="Catalogue products">{result.items.map((p, i) => <ProductCard key={p.slug} product={p} index={(result.page - 1) * 10 + i} />)}</MobileCardRail></section>}
    <Pagination page={result.page} pages={result.pages} pathname="/products" filters={{ cat: requestedCategory, q: query }} />
  </div>;
}
