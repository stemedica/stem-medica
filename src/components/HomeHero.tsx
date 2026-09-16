import Link from "next/link";
import { ArrowDown, ArrowUpRight, MapPin } from "lucide-react";
import { HeroAnimation } from "./HeroAnimation";
import { site } from "@/lib/site";

export function HomeHero() {
  return <section aria-labelledby="hero-title" className="px-3 pt-3 sm:px-5 sm:pt-5">
    <div className="relative isolate mx-auto max-w-[1440px] overflow-hidden rounded-[28px] bg-navy-deep text-white sm:rounded-[36px]">
      <HeroAnimation />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(8,24,48,.94)_0%,rgba(8,24,48,.76)_42%,rgba(8,24,48,.15)_100%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,rgba(8,24,48,.9),transparent_45%)]" />
      <div className="relative z-10 flex min-h-[calc(100svh-132px)] flex-col justify-center px-6 pb-24 pt-7 sm:min-h-[540px] sm:px-10 sm:pb-20 lg:min-h-[560px] lg:px-16">
        <p className="flex items-center gap-2 text-xs font-medium tracking-wide text-white/80"><MapPin size={14} aria-hidden="true" />{site.city}</p>
        <p className="mt-5 text-[10px] font-medium uppercase tracking-[.18em] text-[#b9deec] sm:text-xs">Medical equipment. Human purpose.</p>
        <h1 id="hero-title" className="font-display mt-4 max-w-[13ch] text-[clamp(2.6rem,6.5vw,5.8rem)] font-semibold leading-[1.02] tracking-[-.045em]">Equipment for<br />the <span className="text-[#b9deec]">front line.</span></h1>
        <p className="mt-4 max-w-[35ch] text-base leading-relaxed text-white/85 sm:text-lg">For the teams who care for us.<br />Supplied, installed and supported across Ethiopia.</p>
        <div className="pointer-events-auto mt-5 flex w-full flex-col gap-3 sm:w-fit sm:flex-row sm:flex-wrap">
          <a href="#equipment" className="inline-flex min-h-14 items-center justify-between gap-6 rounded-full bg-white py-2 pl-6 pr-2 text-sm font-semibold text-navy transition-colors hover:bg-blue-50">Browse equipment<span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-white"><ArrowDown size={19} aria-hidden="true" /></span></a>
          <Link href="/quote" className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full border border-white/50 bg-navy-deep/30 px-6 text-sm font-medium text-white transition-colors hover:bg-white/15">Request a quote<ArrowUpRight size={17} aria-hidden="true" /></Link>
        </div>
      </div>
      <a href="#equipment" aria-label="Scroll down to explore equipment" className="absolute bottom-4 left-1/2 z-10 flex size-11 -translate-x-1/2 items-center justify-center rounded-full border border-white/35 text-white hover:bg-white/10 sm:hidden">
        <ArrowDown size={20} className="hero-scroll-arrow" aria-hidden="true" />
      </a>
      <p className="pointer-events-none absolute bottom-6 left-6 z-10 max-w-[35%] text-[9px] uppercase leading-relaxed tracking-[.12em] text-white/65 sm:left-10 sm:max-w-[45%] lg:left-16">STEM MEDICA · Equipment & support</p>
    </div>
  </section>;
}
