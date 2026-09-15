import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { V2Button, V2Pill, V2Photo, V2Head } from "./_components/V2";
import { products } from "@/content/products";
import { getAllPosts, formatDate } from "@/lib/posts";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Homepage v2",
  robots: { index: false, follow: false },
};

const promises = [
  { title: "Lorem ipsum dolor", body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore." },
  { title: "Consectetur adipiscing", body: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo." },
  { title: "Sed do eiusmod tempor", body: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla." },
  { title: "Incididunt ut labore", body: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim." },
];

export default function V2() {
  const featured = products.filter((p) => p.featured).slice(0, 3);
  const posts = getAllPosts().slice(0, 3);

  return (
    <>
      {/* Hero: full-bleed photograph, headline set over it at the bottom. */}
      <section className="px-3 pt-3 sm:px-5 sm:pt-5">
        <div className="v2-frame v2-scrim relative isolate">
          <V2Photo
            label="Hero: installation photograph, full bleed"
            rounded={false}
            className="absolute inset-0 h-full w-full border-0"
          />

          <div className="absolute left-5 top-5 z-10 sm:left-8 sm:top-8">
            <V2Pill>{site.city}</V2Pill>
          </div>

          <div className="relative z-10 flex min-h-[min(86svh,780px)] flex-col justify-end p-6 sm:p-10 lg:p-14">
            <h1 className="font-display wdth-n max-w-[15ch] text-[2.7rem] font-semibold leading-[1.01] tracking-[-0.03em] text-white text-balance sm:text-[4rem] lg:text-[4.9rem]">
              Equipment for the front line
            </h1>
            <p className="mt-6 max-w-[40ch] text-lg leading-relaxed text-white/75">
              Supplied, installed and supported across Ethiopia.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <V2Button badge>Request a quote</V2Button>
              <V2Button variant="glass">Browse equipment</V2Button>
            </div>
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="mx-auto max-w-6xl px-5 py-20 lg:py-28">
        <V2Head
          eyebrow="Why hospitals stay with us"
          title="The equipment is the easy part"
          lede="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        />
        <div className="mt-14 grid gap-5 sm:grid-cols-2">
          {promises.map((p, i) => (
            <div key={p.title} className="v2-card p-7 sm:p-8">
              <span className="label font-medium text-scarlet">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="font-display wdth-n mt-5 text-xl font-semibold leading-snug">{p.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Catalogue: image-led cards */}
      <section className="bg-navy-tint/35">
        <div className="mx-auto max-w-6xl px-5 py-20 lg:py-28">
          <V2Head
            eyebrow="Catalogue"
            title="In stock and on order"
            lede="Device names and brands are real. Specifications and lead times are placeholder until the product list arrives."
          />
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <article key={p.slug} className="v2-card demo-inert overflow-hidden">
                <V2Photo label={`${p.name}: product photo`} rounded={false} className="aspect-[4/3] w-full border-0" />
                <div className="p-6">
                  <h3 className="font-display wdth-n text-lg font-semibold leading-snug text-balance">
                    {p.name}
                  </h3>
                  <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-ink-soft">{p.summary}</p>
                  <div className="mt-5 flex items-center justify-between">
                    <span className="font-mono text-[11px] text-steel">{p.brand}</span>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-tint text-navy">
                      <ArrowRight size={15} aria-hidden="true" />
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-12">
            <V2Button variant="outline">All {products.length} systems</V2Button>
          </div>
        </div>
      </section>

      {/* Split: photo beside copy */}
      <section className="mx-auto max-w-6xl px-5 py-20 lg:py-28">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <V2Photo label="Team or installation photograph" className="aspect-[4/5] w-full" />
          <div>
            <V2Head
              eyebrow="About"
              title="Founded by an engineer, not a trader"
              lede="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation."
            />
            <div className="mt-9">
              <V2Button badge>Read our story</V2Button>
            </div>
          </div>
        </div>
      </section>

      {/* Insights */}
      <section className="mx-auto max-w-6xl px-5 pb-20 lg:pb-28">
        <V2Head
          eyebrow="Insights"
          title="Notes from the field"
          lede="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt."
        />
        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {posts.map((post) => (
            <article key={post.slug} className="v2-card demo-inert flex flex-col p-7">
              <div className="flex items-center justify-between gap-3">
                <V2Pill tone="tint">{post.kind}</V2Pill>
                <span className="label text-steel tabular-nums">{formatDate(post.date)}</span>
              </div>
              <h3 className="font-display wdth-n mt-6 text-xl font-semibold leading-snug text-balance">
                {post.title}
              </h3>
              <p className="mt-3 flex-1 text-[15px] leading-relaxed text-ink-soft">{post.excerpt}</p>
              <span className="mt-7 inline-flex items-center gap-2 text-[15px] font-medium text-navy">
                Read <ArrowRight size={15} aria-hidden="true" />
              </span>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-3 pb-3 sm:px-5 sm:pb-5">
        <div className="v2-frame relative isolate bg-navy-deep px-6 py-24 text-center sm:px-10 sm:py-28">
          <V2Head
            align="center"
            tone="dark"
            eyebrow="Get in touch"
            title="Tell us what your facility needs"
            lede="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore."
          />
          <div className="mt-11 flex flex-wrap justify-center gap-3">
            <V2Button badge>Request a quote</V2Button>
            <V2Button variant="glass">{site.phone}</V2Button>
          </div>
        </div>
      </section>
    </>
  );
}
