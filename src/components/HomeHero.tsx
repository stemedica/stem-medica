import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";

/**
 * Full-bleed opening. The panel runs edge to edge and fills the fold exactly,
 * so the first screen is the hero and nothing else — the inset rounded card it
 * replaced left a frame of page around it and read as one slide of a deck.
 *
 * Content stays on the same 6xl measure as every section below, so the left
 * edge of the headline lines up with the rest of the page on a wide display.
 */
export function HomeHero() {
  return <section aria-labelledby="hero-title" className="relative isolate overflow-hidden bg-navy-deep text-white">
    {/* The supplied artwork, cropped to its photograph. It is the largest
        paint on the page, so it is eager and high priority rather than lazy.
        The ribbon linework it replaced is gone: two backdrops competing for
        the same space made neither read. */}
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      src="/hero-theatre.jpg"
      alt=""
      aria-hidden="true"
      fetchPriority="high"
      decoding="async"
      className="absolute inset-0 -z-10 h-full w-full object-cover object-center"
    />
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(8,24,48,.92)_0%,rgba(8,24,48,.66)_42%,rgba(8,24,48,.20)_100%)]" />
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,rgba(8,24,48,.88),transparent_46%)]" />

    <div className="hero-in hero-recede relative z-10 mx-auto flex min-h-[calc(100svh_-_var(--header-h))] w-full max-w-6xl flex-col justify-center px-5 pb-28 pt-12 sm:px-6 sm:pb-24">
      <h1 id="hero-title" className="mt-4 sm:mt-6 w-full max-w-4xl break-normal tracking-[-.03em]">
        <span className="font-syne block text-[clamp(2.5rem,7vw,5.4rem)] font-extrabold leading-[1.06] tracking-tight text-white">
          One Step Closer<span className="text-scarlet">.</span>
        </span>
        <span className="font-serif italic font-normal block mt-2.5 text-[clamp(1.85rem,5vw,4.2rem)] leading-[1.12] tracking-normal text-[#b9deec]">
          Bridging the Healthcare Gap<span className="font-sans not-italic text-white">.</span>
        </span>
      </h1>
      <p className="mt-6 max-w-[46ch] text-lg sm:text-xl leading-relaxed text-white/90">
        Bringing reliable medical technology, direct factory partnerships, and certified biomedical support within reach of every healthcare facility in Ethiopia.
      </p>
      <div className="mt-9 flex w-full flex-col gap-3 sm:w-fit sm:flex-row sm:flex-wrap">
        <Link prefetch={false} href="/products" className="group inline-flex min-h-14 items-center justify-between gap-6 rounded-full bg-white py-2 pl-7 pr-2 text-sm font-semibold text-navy transition-colors hover:bg-navy-tint">
          Browse equipment
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-white transition-transform duration-300 group-hover:translate-y-0.5">
            <ArrowDown size={19} aria-hidden="true" />
          </span>
        </Link>
        <Link prefetch={false} href="/quote" className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full border border-white/45 px-7 text-sm font-medium text-white transition-colors hover:bg-white/15">
          Request a quote<ArrowUpRight size={17} aria-hidden="true" />
        </Link>
      </div>
    </div>

    <a href="#about" aria-label="Scroll down to read about STEM MEDICA" className="absolute bottom-16 left-1/2 z-10 flex size-11 -translate-x-1/2 items-center justify-center rounded-full border border-white/35 text-white transition-colors hover:bg-white/10 sm:hidden">
      <ArrowDown size={20} className="hero-scroll-arrow" aria-hidden="true" />
    </a>
  </section>;
}
