import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, Phone } from "lucide-react";
import { EcgRule, SectionHead } from "@/components/Section";
import { WaveField } from "@/components/WaveField";
import { Button } from "@/components/Button";
import { ProductCard } from "@/components/ProductCard";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { getCatalogue } from "@/lib/catalogue";
import { site } from "@/lib/site";
import { MobileCardRail } from "@/components/MobileCardRail";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = (await getCatalogue()).products.find((p) => p.slug === slug);
  if (!product) return {};
  return { title: product.name, description: product.summary };
}

export default async function ProductPage({
  params,
}: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { products, categories } = await getCatalogue();
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();
  const category = categories.find((item) => item.slug === product.category);

  const related = products.filter((p) => p.slug !== product.slug).sort((a, b) => Number(b.category === product.category) - Number(a.category === product.category)).slice(0, 3);
  const hasDetails = product.specs.length > 0 || product.services.length > 0;

  return (
    <>
      <div className="relative overflow-hidden bg-navy-deep text-on-navy">
        <WaveField />
        <div className={`relative mx-auto grid max-w-6xl items-center gap-6 px-5 py-8 lg:gap-12 lg:py-16 ${product.image ? "lg:grid-cols-[1.05fr_.95fr]" : ""}`}>
          <div>
            <Link
              href={category ? `/products?cat=${category.slug}` : "/products"}
              className="inline-flex min-h-11 items-center gap-2 text-sm text-white underline underline-offset-4"
            >
              <ArrowLeft size={16} className="shrink-0" aria-hidden="true" /> {category?.name ?? "All equipment"}
            </Link>

            <h1 className="font-display mt-5 max-w-[24ch] break-words text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
              {product.name}
            </h1>
            {product.image ? <div className="mt-6 overflow-hidden rounded-2xl bg-white p-3 lg:hidden"><ImagePlaceholder src={product.image} label={`${product.name}: product photo`} ratio="4/3" className="max-h-72 border-0" /></div> : null}
            {product.summary ? <p className="mt-6 max-w-[54ch] text-[17px] leading-relaxed text-on-navy/70">
              {product.summary}
            </p> : null}

            {/* Nameplate data row: brand, origin, availability, lead time. */}
            <dl className="mt-7 grid grid-cols-2 border border-white/20 font-mono text-xs">
              {[
                ["Brand", product.brand],
                ["Origin", product.origin],
                ["Availability", product.availability],
                ["Lead time", product.leadTime],
              ].filter(([, value]) => value.trim()).map(([k, v], i) => (
                <div
                  key={k}
                  className={`min-w-0 px-3.5 py-3 ${i % 2 === 1 ? "border-l border-white/20" : ""} ${i > 1 ? "border-t border-white/20" : ""}`}
                >
                  <dt className="uppercase tracking-[.1em] text-on-navy/70">{k}</dt>
                  <dd className="mt-1.5 text-on-navy/90">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-6"><Button href={`/quote?item=${encodeURIComponent(product.name)}`} variant="onDark">Request a quote</Button></div>
          </div>

          {product.image ? <div className="relative hidden overflow-hidden rounded-2xl border border-white/20 bg-white p-3 lg:block">
            <ImagePlaceholder
              src={product.image}
              label={`${product.name}: product photo`}
              ratio="4/3"
              tone="dark"
              className="border-0"
            />
          </div> : null}
        </div>
      </div>

      <EcgRule />

      <div className="mx-auto max-w-6xl px-5 py-14 sm:py-20">
        <div className={`grid gap-12 ${hasDetails ? "lg:grid-cols-[1fr_340px]" : "max-w-2xl"}`}>
          {hasDetails ? <div>
            {product.specs.length ? <><SectionHead title="Specifications" />
            <div className="mt-6 overflow-x-auto">
              <table className="w-full table-fixed border-collapse text-left">
                <caption className="sr-only">{product.name} specifications</caption>
                <tbody>
                  {product.specs.map((s) => (
                    <tr key={s.label} className="border-b border-hair">
                      <th scope="row" className="label w-[42%] py-3.5 pr-4 align-top font-medium text-steel">
                        {s.label}
                      </th>
                      <td className="py-3.5 font-mono text-sm text-ink">{s.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div></> : null}

            {product.services.length ? <div className="mt-14">
              <SectionHead title="What’s included" />
              <ul className="mt-6 grid gap-px border border-hair bg-hair sm:grid-cols-2">
                {product.services.map((s) => (
                  <li key={s} className="bg-white px-4 py-4 text-sm font-medium">{s}</li>
                ))}
              </ul>
            </div> : null}
          </div> : null}

          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="plate ticks p-6">
              <h2 className="font-display wdth-n text-xl font-semibold">
                Ask about this equipment
              </h2>
              <p className="mt-2 text-base leading-relaxed text-ink-soft">
                We’ll confirm the model, price, delivery time and any support you need.
              </p>
              <div className="mt-6 flex flex-col gap-2.5">
                <Button href={`/quote?item=${encodeURIComponent(product.name)}`} className="w-full">
                  Request a quote
                </Button>
                <Button href={`tel:${site.phoneIntl}`} variant="outline" className="w-full">
                  <Phone size={14} aria-hidden="true" /> Call {site.phone}
                </Button>
              </div>
            </div>
          </aside>
        </div>

        {related.length > 0 ? (
          <div className="mt-20">
            <SectionHead
              title="Other equipment"
            />
            <div className="mt-8"><MobileCardRail label="Related equipment">
              {related.map((p, i) => (
                <ProductCard key={p.slug} product={p} index={i} />
              ))}
            </MobileCardRail></div>
          </div>
        ) : null}
      </div>
    </>
  );
}
