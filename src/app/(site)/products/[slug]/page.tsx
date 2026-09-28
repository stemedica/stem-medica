import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, Phone } from "lucide-react";
import { SectionHead } from "@/components/Section";
import { Button } from "@/components/Button";
import { ProductCard } from "@/components/ProductCard";
import { AvailabilityTag } from "@/components/AvailabilityTag";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { getCatalogue } from "@/lib/catalogue";
import { site } from "@/lib/site";
import { ProductSchema, BreadcrumbSchema } from "@/components/StructuredData";
import { MobileCardRail } from "@/components/MobileCardRail";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = (await getCatalogue()).products.find((p) => p.slug === slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.summary,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      type: "website",
      title: product.name,
      description: product.summary,
      url: `${site.url}/products/${product.slug}`,
      images: product.image ? [{ url: `${site.url}${product.image}`, alt: product.name }] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { products, categories } = await getCatalogue();
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();
  const category = categories.find((item) => item.slug === product.category);

  const related = products
    .filter((p) => p.slug !== product.slug)
    .sort((a, b) => Number(b.category === product.category) - Number(a.category === product.category))
    .slice(0, 3);
  const hasDetails = product.specs.length > 0 || product.services.length > 0;

  return (
    <>
      <ProductSchema
        name={product.name}
        description={product.summary}
        image={product.image || undefined}
        brand={product.brand || undefined}
        slug={product.slug}
      />
      <BreadcrumbSchema
        trail={[
          { name: "Home", path: "" },
          { name: "Products", path: "/products" },
          ...(category ? [{ name: category.name, path: `/products?cat=${category.slug}` }] : []),
          { name: product.name, path: `/products/${product.slug}` },
        ]}
      />

      <div className="mx-auto max-w-6xl px-5 py-8 sm:py-14">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-2 text-sm text-steel">
          <Link
            href="/products"
            className="inline-flex min-h-11 items-center gap-1.5 text-navy underline underline-offset-4"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            All equipment
          </Link>
          {category ? (
            <>
              <span aria-hidden="true">/</span>
              <Link
                href={`/products?cat=${category.slug}`}
                className="inline-flex min-h-11 items-center text-navy underline underline-offset-4"
              >
                {category.name}
              </Link>
            </>
          ) : null}
        </nav>

        {/* Hero grid: text left, image right */}
        <div className="grid gap-10 lg:grid-cols-[1fr_420px] lg:gap-16">

          {/* ── Left: identity ── */}
          <div>
            {/* Category label + brand */}
            {category ? (
              <p className="label text-sm font-semibold uppercase tracking-widest text-scarlet">
                {category.name}
              </p>
            ) : null}
            {product.brand && product.brand !== "—" ? (
              <p className="mt-1 text-xl font-semibold text-ink">
                {product.brand}
                {product.model ? <span className="ml-2.5 font-normal text-steel">· {product.model}</span> : null}
              </p>
            ) : product.model ? (
              <p className="mt-1 text-xl font-semibold text-ink">
                {product.model}
              </p>
            ) : null}

            {/* Title */}
            <h1 className="font-display wdth-w mt-4 max-w-[22ch] text-[clamp(2rem,4.2vw,3.4rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-navy text-balance">
              {product.name}<span className="text-scarlet">.</span>
            </h1>

            {product.summary ? (
              <p className="mt-5 max-w-[58ch] text-[17px] leading-relaxed text-ink-soft">
                {product.summary}
              </p>
            ) : null}

            {/* Nameplate data row */}
            <dl className="mt-8 grid grid-cols-2 overflow-hidden rounded-xl border border-hair font-mono text-xs">
              {(
                [
                  ["Brand", product.brand],
                  ["Model", product.model || ""],
                  ["Origin", product.origin],
                  ["Availability", product.availability],
                  ["Lead time", product.leadTime],
                ] as [string, string][]
              )
                .filter(([, value]) => value && value.trim() && value !== "—")
                .map(([k, v], i) => (
                  <div
                    key={k}
                    className={[
                      "min-w-0 bg-white px-4 py-3.5",
                      i % 2 === 1 ? "border-l border-hair" : "",
                      i >= 2 ? "border-t border-hair" : "",
                    ].join(" ")}
                  >
                    <dt className="uppercase tracking-[.08em] text-steel">{k}</dt>
                    <dd className="mt-1.5 font-medium text-ink">
                      {k === "Availability" ? (
                        <AvailabilityTag availability={product.availability} />
                      ) : (
                        v
                      )}
                    </dd>
                  </div>
                ))}
            </dl>

            <div className="mt-7 flex flex-wrap gap-3">
              <Button href={`/quote?item=${encodeURIComponent(product.name)}`}>
                Request a quote
              </Button>
              <Button href={`tel:${site.phoneIntl}`} variant="outline">
                <Phone size={14} aria-hidden="true" /> Call {site.phone}
              </Button>
            </div>
          </div>

          {/* ── Right: image — always shown, placeholder when empty ── */}
          <div className="order-first lg:order-last">
            {product.image ? (
              <div className="overflow-hidden rounded-2xl border border-hair bg-white p-3">
                <ImagePlaceholder
                  src={product.image}
                  label={`${product.name}: product photo`}
                  ratio="4/3"
                  className="border-0"
                />
              </div>
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center rounded-2xl border border-dashed border-hair bg-paper">
                <p className="text-sm text-steel">Image coming soon</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Specs & aside ── */}
        {hasDetails ? (
          <div className="mt-16 grid gap-12 border-t border-hair pt-14 lg:grid-cols-[1fr_300px]">
            <div>
              {product.specs.length ? (
                <>
                  <SectionHead title="Specifications" />
                  <div className="mt-6 overflow-x-auto">
                    <table className="w-full table-fixed border-collapse text-left">
                      <caption className="sr-only">{product.name} specifications</caption>
                      <tbody>
                        {product.specs.map((s) => (
                          <tr key={s.label} className="border-b border-hair">
                            <th
                              scope="row"
                              className="label w-[42%] py-3.5 pr-4 align-top font-medium text-steel"
                            >
                              {s.label}
                            </th>
                            <td className="py-3.5 font-mono text-sm text-ink">{s.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : null}

              {product.services.length ? (
                <div className="mt-14">
                  <SectionHead title="What's included" />
                  <ul className="mt-6 grid gap-px border border-hair bg-hair sm:grid-cols-2">
                    {product.services.map((s) => (
                      <li key={s} className="bg-white px-4 py-4 text-sm font-medium">
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            <aside className="lg:sticky lg:top-6 lg:self-start">
              <div className="plate ticks p-6">
                <h2 className="font-display wdth-n text-xl font-semibold">
                  Ask about this equipment
                </h2>
                <p className="mt-2 text-base leading-relaxed text-ink-soft">
                  We'll confirm the model, price, delivery time and any support you need.
                </p>
                <div className="mt-6 flex flex-col gap-2.5">
                  <Button
                    href={`/quote?item=${encodeURIComponent(product.name)}`}
                    className="w-full"
                  >
                    Request a quote
                  </Button>
                  <Button href={`tel:${site.phoneIntl}`} variant="outline" className="w-full">
                    <Phone size={14} aria-hidden="true" /> Call {site.phone}
                  </Button>
                </div>
              </div>
            </aside>
          </div>
        ) : null}

        {/* ── Related equipment ── */}
        {related.length > 0 ? (
          <div className="mt-20 border-t border-hair pt-14">
            <SectionHead title="Other equipment" />
            <div className="mt-8">
              <MobileCardRail label="Related equipment">
                {related.map((p, i) => (
                  <ProductCard
                    key={p.slug}
                    product={p}
                    index={i}
                    categoryName={
                      categories.find((c) => c.slug === p.category)?.name ?? ""
                    }
                  />
                ))}
              </MobileCardRail>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
