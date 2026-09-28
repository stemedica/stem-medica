import type { Metadata } from "next";
import Link from "next/link";
import { getCatalogue } from "@/lib/catalogue";
import { CatalogueBrowser } from "@/components/CatalogueBrowser";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import type { CatalogueItem } from "@/lib/cms-schema";

export const metadata: Metadata = {
  alternates: { canonical: "/products" },
  title: "Products",
  description: "Medical equipment, supplies and devices for hospitals, clinics and laboratories across Ethiopia.",
};

export default async function ProductsPage({ searchParams }: {
  searchParams: Promise<{ cat?: string | string[]; q?: string | string[] }>;
}) {
  const params = await searchParams;
  const { products, categories } = await getCatalogue();
  const requestedCategory = typeof params.cat === "string" ? params.cat : "";
  const category = categories.find((item) => item.slug === requestedCategory);
  const query = typeof params.q === "string" ? params.q.trim().slice(0, 200) : "";

  // Specs and services are the bulk of a product and no card reads them.
  const listing: CatalogueItem[] = products.map((product) => ({
    slug: product.slug, name: product.name, brand: product.brand, model: product.model || "", origin: product.origin,
    category: product.category, image: product.image, summary: product.summary,
    availability: product.availability, leadTime: product.leadTime,
    featured: product.featured, published: product.published,
  }));

  return <div className="mx-auto max-w-6xl px-5 py-8 sm:py-14">
    <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-2 text-sm text-steel">
      <Link href="/" className="inline-flex min-h-11 items-center text-navy underline underline-offset-4">Home</Link>
      <span aria-hidden="true">/</span>
      {category
        ? <><Link href="/products" className="inline-flex min-h-11 items-center text-navy underline underline-offset-4">All equipment</Link><span aria-hidden="true">/</span><span aria-current="page">{category.name}</span></>
        : <span aria-current="page">All equipment</span>}
    </nav>

    <header className={`grid items-center gap-6 ${category?.image ? "sm:grid-cols-[1fr_240px]" : "max-w-3xl"}`}>
      <div>
        <h1 className="font-display wdth-w max-w-[18ch] text-[clamp(2.2rem,4.6vw,3.9rem)] font-semibold leading-[1.04] tracking-[-.035em] text-navy text-balance">
          {category?.name ?? "All equipment"}<span className="text-scarlet">.</span>
        </h1>
        <p className="mt-4 max-w-[62ch] text-base leading-relaxed text-ink-soft">
          {category?.blurb || "Search the catalogue, then ask us to confirm the model, price and delivery time. If we do not list it, we can still source it."}
        </p>
      </div>
      {category?.image ? <ImagePlaceholder src={category.image} label={category.name} ratio="4/3" className="max-h-48 rounded-2xl border border-hair bg-white" /> : null}
    </header>

    {/* The hardcoded family list that sat here named the same ten categories as
        the filter twenty pixels below it, as plain text rather than links, and
        pushed the first product a full screen down on a phone. */}
    {/* Keyed on the filters it was given. Navigating from /products to
        /products?cat=… is the same route, so React would otherwise keep the
        browser's existing state and the heading would change while the results
        did not. */}
    <CatalogueBrowser
      key={`${category ? category.slug : ""}|${query}`}
      products={listing}
      categories={categories}
      initialQuery={query}
      initialCategory={category ? category.slug : ""}
    />
  </div>;
}
