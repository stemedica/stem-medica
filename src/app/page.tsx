import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { Section, SectionHead, Tag } from "@/components/Section";
import { WaveField } from "@/components/WaveField";
import { Button } from "@/components/Button";
import { StatBand } from "@/components/StatBand";
import { ProductCard } from "@/components/ProductCard";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { products } from "@/content/products";
import { getAllPosts, formatDate } from "@/lib/posts";
import { site } from "@/lib/site";

/** Titles are structural; bodies are LOREM until STEM MEDICA supplies copy. */
const promises = [
  { title: "Lorem ipsum dolor", body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
  { title: "Consectetur adipiscing", body: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute." },
  { title: "Sed do eiusmod tempor", body: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint." },
  { title: "Incididunt ut labore", body: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum sed." },
];

export default function Home() {
  const featured = products.filter((p) => p.featured).slice(0, 3);
  const posts = getAllPosts().slice(0, 3);

  return (
    <>
      {/* ---------------- Hero ---------------- */}
      <section className="relative overflow-hidden bg-navy-deep text-on-navy">
        <WaveField />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "linear-gradient(168deg, rgba(46,91,184,.28) 0%, transparent 48%, rgba(11,20,42,.6) 100%)" }}
        />

        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 pb-16 pt-12 lg:grid-cols-[1.05fr_.95fr] lg:pb-20 lg:pt-16">
          <div className="rise">
            <Tag index="ET" tone="dark">Addis Ababa · Nationwide</Tag>

            <h1 className="font-display wdth-w mt-7 text-[2.75rem] font-bold uppercase leading-[0.92] tracking-[-0.04em] text-balance sm:text-6xl lg:text-[4.5rem]">
              Equipment for the<br />
              <span className="text-scarlet-lift">front line</span>
            </h1>

            {/* Scarlet rule instead of a gradient flourish. */}
            <div className="mt-7 h-0.5 w-20 bg-scarlet" />

            <p className="mt-7 max-w-[50ch] text-lg leading-relaxed text-on-navy/70">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad
              minim veniam.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Button href="/products">
                Browse equipment <ArrowRight size={15} aria-hidden="true" />
              </Button>
              <Button href={`tel:${site.phoneIntl}`} variant="onDark">
                <Phone size={14} aria-hidden="true" /> {site.phone}
              </Button>
            </div>
          </div>

          {/* Hero panel: the device itself, framed like a rack-mounted unit. */}
          <div className="rise relative [animation-delay:120ms]">
            <div className="ticks relative border border-white/20 bg-navy-deep/60 p-1.5 shadow-deep backdrop-blur-sm">
              <ImagePlaceholder
                label="Hero: installation or device photo"
                ratio="4/3"
                tone="dark"
                className="border-0"
              />
            </div>

            <div className="mt-px grid grid-cols-3 border border-t-0 border-white/20 font-mono text-[10.5px] uppercase tracking-[.16em]">
              {[
                ["Unit", "Lorem"],
                ["Dept", "ICU"],
                ["Status", "Lorem"],
              ].map(([k, v], i) => (
                <div key={k} className={`px-3 py-2.5 ${i > 0 ? "border-l border-white/20" : ""}`}>
                  <div className="text-on-navy/40">{k}</div>
                  <div className="mt-1 text-on-navy/90">{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative mx-auto max-w-6xl px-5 pb-16">
          <StatBand />
        </div>
      </section>

      {/* ---------------- Why ---------------- */}
      <Section
        index="01"
        label="Why hospitals stay"
        title="The equipment is the easy part"
        lede="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        meta="04 commitments"
      >
        {/* A ruled list, not four shadowed cards. */}
        <ol className="mt-12 border-t border-hair">
          {promises.map((p, i) => (
            <li
              key={p.title}
              className="group grid grid-cols-[3rem_1fr] gap-x-5 border-b border-hair py-6 transition-colors hover:bg-navy-tint/35 sm:grid-cols-[5rem_minmax(0,18rem)_1fr] sm:gap-x-8"
            >
              <span className="stamp pt-1 text-xl text-scarlet">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="font-display wdth-n text-lg font-semibold leading-snug">{p.title}</h3>
              <p className="col-start-2 mt-2 max-w-[58ch] text-[15px] leading-relaxed text-ink-soft sm:col-start-3 sm:mt-1">
                {p.body}
              </p>
            </li>
          ))}
        </ol>
      </Section>

      {/* ---------------- Featured ---------------- */}
      <Section
        index="02"
        label="Catalogue"
        title="In stock and on order"
        lede="Device names and brands are real. Specifications, availability and lead times are placeholder until the product list arrives."
        meta={`${String(products.length).padStart(2, "0")} systems`}
      >
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p, i) => (
            <ProductCard key={p.slug} product={p} index={i} />
          ))}
        </div>
        <div className="mt-10">
          <Button href="/products" variant="outline">
            All {products.length} systems <ArrowRight size={15} aria-hidden="true" />
          </Button>
        </div>
      </Section>

      {/* ---------------- Insights ---------------- */}
      <Section
        index="03"
        label="Insights"
        title="Notes from the field"
        lede="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt."
        meta={`${String(posts.length).padStart(2, "0")} posts`}
        tone="tint"
      >
        <div className="mt-12 grid gap-px border border-hair bg-hair lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group relative flex flex-col bg-white p-6 transition-colors hover:bg-paper"
            >
              <div className="label flex items-baseline justify-between gap-3 text-steel">
                <span className="text-scarlet">{post.kind}</span>
                <span className="tabular-nums">{formatDate(post.date)}</span>
              </div>
              <h3 className="font-display wdth-n mt-4 text-lg font-semibold leading-snug text-balance">
                {post.title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{post.excerpt}</p>
              <span className="label mt-6 inline-flex items-center gap-2 font-semibold text-navy">
                Read
                <ArrowRight
                  size={13}
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </span>
              <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-scarlet transition-all duration-400 ease-[cubic-bezier(.22,.61,.36,1)] group-hover:w-full" />
            </Link>
          ))}
        </div>
      </Section>

      {/* ---------------- CTA ---------------- */}
      <section className="relative overflow-hidden bg-navy-deep text-on-navy">
        <WaveField />
        <div className="relative mx-auto max-w-6xl px-5 py-20 sm:py-24">
          <div className="max-w-3xl">
            <SectionHead
              index="04"
              label="Contact"
              title="Tell us what your facility needs"
              lede="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna."
              tone="dark"
            />
            <div className="mt-9 flex flex-wrap gap-3">
              <Button href={`tel:${site.phoneIntl}`}>
                <Phone size={14} aria-hidden="true" /> Call {site.phone}
              </Button>
              <Button href={site.whatsapp} variant="onDark">WhatsApp</Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
