import Link from "next/link";
import { ArrowDown, ArrowUpRight, MapPin } from "lucide-react";
import { HeroAnimation } from "./HeroAnimation";
import { site } from "@/lib/site";

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
    <HeroAnimation />
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(8,24,48,.95)_0%,rgba(8,24,48,.74)_46%,rgba(8,24,48,.18)_100%)]" />
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,rgba(8,24,48,.92),transparent_44%)]" />

    <div className="hero-in hero-recede relative z-10 mx-auto flex min-h-[calc(100svh_-_var(--header-h))] w-full max-w-6xl flex-col justify-center px-5 pb-28 pt-12 sm:px-6 sm:pb-24">
      <p className="flex items-center gap-2 text-sm font-medium text-white/75">
        <MapPin size={15} aria-hidden="true" />{site.city}
      </p>
      <h1 id="hero-title" className="font-display wdth-xw mt-7 max-w-[13ch] text-[clamp(2.75rem,7vw,5.75rem)] font-semibold leading-[1.02] tracking-[-.035em] text-balance">
        Quality equipment.<br /><span className="text-[#b9deec]">Better care.</span>
      </h1>
      <p className="mt-6 max-w-[42ch] text-lg leading-relaxed text-white/85">
        Medical supplies, devices and equipment—distributed and supported across Ethiopia.
      </p>
      <div className="mt-9 flex w-full flex-col gap-3 sm:w-fit sm:flex-row sm:flex-wrap">
        <a href="#equipment" className="group inline-flex min-h-14 items-center justify-between gap-6 rounded-full bg-white py-2 pl-7 pr-2 text-sm font-semibold text-navy transition-colors hover:bg-navy-tint">
          Browse equipment
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-white transition-transform duration-300 group-hover:translate-y-0.5">
            <ArrowDown size={19} aria-hidden="true" />
          </span>
        </a>
        <Link prefetch={false} href="/quote" className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full border border-white/45 px-7 text-sm font-medium text-white transition-colors hover:bg-white/15">
          Request a quote<ArrowUpRight size={17} aria-hidden="true" />
        </Link>
      </div>
    </div>

    <a href="#equipment" aria-label="Scroll down to explore equipment" className="absolute bottom-16 left-1/2 z-10 flex size-11 -translate-x-1/2 items-center justify-center rounded-full border border-white/35 text-white transition-colors hover:bg-white/10 sm:hidden">
      <ArrowDown size={20} className="hero-scroll-arrow" aria-hidden="true" />
    </a>
  </section>;
}
