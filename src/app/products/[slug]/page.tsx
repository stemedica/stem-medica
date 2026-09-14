import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, Phone, Mail } from "lucide-react";
import { EcgRule, SectionHead } from "@/components/Section";
import { WaveField } from "@/components/WaveField";
import { Button } from "@/components/Button";
import { ProductCard } from "@/components/ProductCard";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { products, productBySlug } from "@/content/products";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product) return {};
  return { title: product.name, description: product.summary };
}

export default async function ProductPage({
  params,
}: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product) notFound();

  const related = products.filter((p) => p.slug !== product.slug).slice(0, 3);

  return (
    <>
      <div className="relative overflow-hidden bg-navy-deep text-on-navy">
        <WaveField />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-12 lg:grid-cols-[1.05fr_.95fr] lg:py-16">
          <div>
            <Link
              href="/products"
              className="label inline-flex items-center gap-2 text-scarlet-lift"
            >
              <ArrowLeft size={13} aria-hidden="true" /> All equipment
            </Link>

            <h1 className="font-display wdth-w mt-7 max-w-[18ch] text-[2rem] font-bold uppercase leading-[1] tracking-[-0.03em] text-balance sm:text-[2.9rem]">
              {product.name}
            </h1>
            <div className="mt-6 h-0.5 w-16 bg-scarlet" />
            <p className="mt-6 max-w-[54ch] text-[17px] leading-relaxed text-on-navy/70">
              {product.summary}
            </p>

            {/* Nameplate data row — brand, origin, availability, lead time. */}
            <dl className="mt-9 grid grid-cols-2 border border-white/20 font-mono text-[11px] sm:grid-cols-4">
              {[
                ["Brand", product.brand],
                ["Origin", product.origin],
                ["Availability", product.availability],
                ["Lead time", product.leadTime],
              ].map(([k, v], i) => (
                <div
                  key={k}
                  className={`px-3.5 py-3 ${i % 2 === 1 ? "border-l border-white/20" : ""} ${
                    i > 1 ? "border-t border-white/20 sm:border-t-0" : ""
                  } sm:border-l sm:first:border-l-0`}
                >
                  <dt className="uppercase tracking-[.16em] text-on-navy/40">{k}</dt>
                  <dd className="mt-1.5 text-on-navy/90">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="ticks relative border border-white/20 bg-navy-deep/60 p-1.5 shadow-deep">
            <ImagePlaceholder
              label={`${product.name} — product photo`}
              ratio="4/3"
              tone="dark"
              className="border-0"
            />
          </div>
        </div>
      </div>

      <EcgRule />

      <div className="mx-auto max-w-6xl px-5 py-14 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1fr_340px]">
          <div>
            <SectionHead index="01" label="Specification" meta="Placeholder data" />
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[420px] border-collapse text-left">
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
            </div>

            <div className="mt-14">
              <SectionHead index="02" label="Included with supply" />
              <ul className="mt-6 grid gap-px border border-hair bg-hair sm:grid-cols-2">
                {product.services.map((s) => (
                  <li key={s} className="bg-white px-4 py-4 text-sm font-medium">{s}</li>
                ))}
              </ul>
            </div>
          </div>

          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="plate ticks p-6">
              <div className="label text-steel">Enquiry</div>
              <h2 className="font-display wdth-n mt-2.5 text-xl font-semibold">
                Request a quotation
              </h2>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore.
              </p>
              <div className="mt-6 flex flex-col gap-2.5">
                <Button href={`tel:${site.phoneIntl}`} className="w-full">
                  <Phone size={14} aria-hidden="true" /> Call {site.phone}
                </Button>
                <Button
                  href={`mailto:${site.email}?subject=${encodeURIComponent(`Enquiry: ${product.name}`)}`}
                  variant="outline"
                  className="w-full"
                >
                  <Mail size={14} aria-hidden="true" /> Email enquiry
                </Button>
              </div>
            </div>
          </aside>
        </div>

        {related.length > 0 ? (
          <div className="mt-20">
            <SectionHead
              index="03"
              label="Other equipment"
              meta={`${String(related.length).padStart(2, "0")} systems`}
            />
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p, i) => (
                <ProductCard key={p.slug} product={p} index={i} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
