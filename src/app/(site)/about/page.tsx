import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { V2Photo } from "@/components/V2";
import { LocationMap } from "@/components/LocationMap";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/about" },
  title: "About",
  description: "Learn how STEM MEDICA is improving access to quality, affordable medical equipment across Ethiopia.",
};

/** Drawn from the service page, so the two cannot drift apart. */
const WHAT_WE_DO: [string, string][] = [
  ["Import and distribute", "Medical supplies, devices and equipment brought in from manufacturers and exporters we deal with directly."],
  ["Install and commission", "Equipment set up at your facility and handed over working, coordinated with delivery and shipping."],
  ["Train and support", "Your team shown how to use what we supplied, with spare parts and technical help afterwards."],
];

export default function AboutPage() {
  return <>
    <section aria-labelledby="about-title" className="border-b border-hair bg-white px-5 py-14 sm:px-6 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-sm text-steel">
          <Link href="/" className="inline-flex min-h-11 items-center text-navy underline underline-offset-4">Home</Link>
          <span aria-hidden="true">/</span><span aria-current="page">About</span>
        </nav>

        <h1 id="about-title" className="reveal font-display wdth-w max-w-[18ch] text-[clamp(2.4rem,5.4vw,4.5rem)] font-semibold leading-[1.02] tracking-[-.035em] text-navy text-balance">
          Closing the healthcare technology gap<span className="text-scarlet">.</span>
        </h1>

        <div className="reveal mt-12 grid gap-10 lg:mt-14 lg:grid-cols-2 lg:items-start lg:gap-16">
          <V2Photo label="STEM MEDICA team at work" rounded={false} className="aspect-[4/3] w-full rounded-2xl lg:aspect-[5/4]" />
          <div className="space-y-5 text-lg leading-relaxed text-ink-soft">
            <p>STEM MEDICA is a registered medical importing company distributing medical supplies, devices and equipment across Ethiopia.</p>
            <p>Ethiopia faces a significant gap in healthcare technology and access to quality medical supplies. We focus on quality and affordability so more hospitals, clinics, laboratories and health professionals can reach the technology they need.</p>
            <p>Our mission is to advance medical research and development and improve healthcare outcomes across the country — through collaboration, innovation, and product support that does not stop at delivery.</p>
          </div>
        </div>
      </div>
    </section>

    <section aria-labelledby="what-we-do" className="px-5 py-14 sm:px-6 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <h2 id="what-we-do" className="reveal font-display wdth-w max-w-[18ch] text-[clamp(2rem,4.2vw,3.4rem)] font-semibold leading-[1.05] tracking-[-.035em] text-navy text-balance">
          What we actually do<span className="text-scarlet">.</span>
        </h2>
        <dl className="reveal-stagger mt-10 grid overflow-hidden rounded-2xl border border-hair bg-white divide-y divide-hair sm:grid-cols-3 sm:divide-x sm:divide-y-0 lg:mt-12">
          {WHAT_WE_DO.map(([term, detail]) => (
            <div key={term} className="reveal p-6 lg:p-7">
              <dt className="font-display text-lg font-semibold text-navy">{term}</dt>
              <dd className="mt-2.5 text-[15px] leading-relaxed text-ink-soft">{detail}</dd>
            </div>
          ))}
        </dl>

        <div className="reveal mt-10 flex flex-wrap gap-4">
          <Link href="/products" className="inline-flex min-h-12 items-center gap-3 rounded-full border border-navy px-6 text-sm font-semibold text-navy transition-colors hover:bg-navy hover:text-white">
            Browse equipment <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
          <Link href="/service" className="inline-flex min-h-12 items-center gap-2.5 text-sm font-semibold text-navy underline underline-offset-4">
            How we support you <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>

    <section aria-labelledby="find-us" className="border-t border-hair bg-white px-5 py-14 sm:px-6 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="reveal flex flex-wrap items-end justify-between gap-5">
          <h2 id="find-us" className="font-display wdth-w max-w-[16ch] text-[clamp(2rem,4.2vw,3.4rem)] font-semibold leading-[1.05] tracking-[-.035em] text-navy text-balance">
            Find us in Addis Ababa<span className="text-scarlet">.</span>
          </h2>
          <p className="max-w-[40ch] text-base leading-relaxed text-ink-soft">{site.address}</p>
        </div>
        <div className="reveal mt-10"><LocationMap /></div>
      </div>
    </section>

    <section className="px-5 pb-16 sm:px-6 lg:pb-24">
      <div className="reveal mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-5 rounded-2xl border border-hair bg-paper p-6 sm:p-8">
        <div>
          <h2 className="font-display text-xl font-semibold text-navy">Tell us what your facility needs</h2>
          <p className="mt-2 max-w-[56ch] text-base leading-relaxed text-ink-soft">
            Send your equipment list with quantities and we will come back with pricing and delivery time.
          </p>
        </div>
        <Link href="/quote" className="inline-flex min-h-12 shrink-0 items-center gap-3 rounded-full bg-scarlet px-6 text-sm font-semibold text-white transition-colors hover:bg-vital">
          Request a quote <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </div>
    </section>
  </>;
}
