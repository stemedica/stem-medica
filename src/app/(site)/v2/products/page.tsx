import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { V2Button, V2Pill, V2Photo, V2Head } from "../_components/V2";
import { products } from "@/content/products";
import { categories, categoryOf } from "@/content/categories";

export const metadata: Metadata = {
  title: "Products v2",
  robots: { index: false, follow: false },
};

export default function V2Products() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-5 pt-12 lg:pt-16">
        <V2Head
          eyebrow="Catalogue"
          title="Everything we supply"
          lede="Listed down the page by category. Device names and brands are real; specifications and lead times are placeholder."
        />

        {/* Category jump bar. Inert: this is a design comparison. */}
        <div className="-mx-5 mt-8 overflow-x-auto px-5 pb-1">
          <div className="flex w-max gap-2">
            <span className="v2-pill demo-inert bg-navy text-white">All {products.length}</span>
            {categories.map((c) => (
              <span key={c.slug} className="v2-pill demo-inert border border-hair bg-white text-ink-soft">
                {c.short}
                <span className="text-steel tabular-nums">
                  {String(products.filter((p) => categoryOf[p.slug] === c.slug).length).padStart(2, "0")}
                </span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* One block per category, stacked down the page. */}
      {categories.map((c) => {
        const items = products.filter((p) => categoryOf[p.slug] === c.slug);
        if (items.length === 0) return null;
        return (
          <section key={c.slug} className="mx-auto max-w-6xl px-5 py-10 lg:py-12">
            <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-hair pb-4">
              <h2 className="font-display wdth-n text-[1.4rem] font-semibold tracking-[-0.02em]">
                {c.name}
              </h2>
              <span className="label text-steel tabular-nums">
                {String(items.length).padStart(2, "0")} systems
              </span>
            </div>

            <div className="mt-6 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((p) => (
                <article key={p.slug} className="v2-card demo-inert overflow-hidden">
                  <V2Photo label={`${p.name}: product photo`} rounded={false}
                           className="aspect-[16/10] w-full border-0" />
                  <div className="p-5">
                    <div className="flex items-center justify-between gap-3">
                      <V2Pill tone="tint">{c.short}</V2Pill>
                      <span className="font-mono text-[11px] text-steel">{p.origin}</span>
                    </div>
                    <h3 className="font-display wdth-n mt-4 text-[16.5px] font-semibold leading-snug text-balance">
                      {p.name}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-[14px] leading-relaxed text-ink-soft">
                      {p.summary}
                    </p>
                    <div className="mt-4 flex items-center justify-between border-t border-hair pt-3.5">
                      <span className="font-mono text-[11px] text-steel">{p.brand}</span>
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-tint text-navy">
                        <ArrowRight size={15} aria-hidden="true" />
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}

      <section className="px-3 pb-3 sm:px-5 sm:pb-5">
        <div className="v2-frame bg-navy-deep px-6 py-16 text-center sm:px-10 sm:py-20">
          <V2Head
            align="center"
            tone="dark"
            eyebrow="Not listed?"
            title="We very likely still supply it"
            lede="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt."
          />
          <div className="mt-8 flex justify-center">
            <V2Button badge>Request a quote</V2Button>
          </div>
        </div>
      </section>
    </>
  );
}
