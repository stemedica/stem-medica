import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { Section, SectionHead, Tag } from "@/components/Section";
import { WaveField } from "@/components/WaveField";
import { Button } from "@/components/Button";
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
      {/* ---------------- Hero ----------------
          Height is min-height with a cap, never 100vh: a hard viewport height
          strands the fold on short laptop screens and hides the scroll cue.
          88svh leaves a sliver of the next section showing. */}
      <section className="relative flex min-h-[min(88svh,780px)] flex-col overflow-hidden bg-navy-deep text-on-navy">
        <WaveField />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "linear-gradient(168deg, rgba(46,91,184,.3) 0%, transparent 46%, rgba(11,20,42,.66) 100%)" }}
        />

        <div className="relative mx-auto flex w-full max-w-6xl flex-1 items-center px-5 py-14 lg:py-16">
          <div className="grid w-full items-center gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
            <div className="rise">
              <Tag index="ET" tone="dark">Addis Ababa</Tag>

              <h1 className="font-display wdth-w mt-8 text-[3rem] font-bold uppercase leading-[0.9] tracking-[-0.04em] text-balance sm:text-[4.25rem] lg:text-[5rem]">
                Equipment<br />for the<br />
                <span className="text-scarlet-lift">front line</span>
              </h1>

              <div className="mt-8 h-0.5 w-20 bg-scarlet" />

              <p className="mt-8 max-w-[34ch] text-lg leading-relaxed text-on-navy/70">
                Supplied, installed and supported across Ethiopia.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <Button href="/quote">
                  Request a quote <ArrowRight size={15} aria-hidden="true" />
                </Button>
                <Button href="/products" variant="onDark">
                  Browse equipment
                </Button>
              </div>
            </div>

            <div className="rise [animation-delay:140ms]">
              <div className="ticks relative border border-white/20 p-1.5">
                <ImagePlaceholder
                  label="Hero: installation or device photo"
                  ratio="4/3"
                  tone="dark"
                  className="border-0"
                />
              </div>
            </div>
          </div>
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
