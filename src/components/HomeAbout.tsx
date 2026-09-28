import Link from "next/link";
import { ArrowUpRight, Award, Compass, Target } from "lucide-react";
import { V2Photo } from "./V2";
import { QuietTrace } from "./QuietTrace";

/**
 * The company, stated at full scale.
 *
 * Sits directly under the hero, so it carries the weight of an opening
 * statement: the heading runs at display size on Archivo's wide axis, and the
 * photograph is given real area rather than a thumbnail beside a link.
 *
 * Every sentence is taken from the about page, so the two cannot drift, and
 * the figure in the panel is read from the catalogue rather than asserted.
 */
export function HomeAbout({ categoryCount }: { categoryCount: number }) {
  return <section aria-labelledby="about" className="border-b border-hair bg-white px-5 py-20 sm:px-6 lg:py-28">
    <div className="mx-auto max-w-6xl">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-scarlet">
        <span className="h-2 w-2 rounded-full bg-scarlet" aria-hidden="true" />
        About STEM MEDICA
      </div>
      <h2 id="about" className="reveal font-display wdth-w mt-3 max-w-[20ch] text-[clamp(2.4rem,5.4vw,4.5rem)] font-semibold leading-[1.02] tracking-[-.035em] text-navy text-balance">
        Improving access to modern healthcare technology<span className="text-scarlet">.</span>
      </h2>

      <div className="reveal mt-12 grid gap-10 lg:mt-16 lg:grid-cols-2 lg:items-start lg:gap-16">
        <V2Photo
          label="STEM MEDICA team and medical equipment"
          rounded={false}
          className="aspect-[4/3] w-full rounded-2xl lg:aspect-[5/4]"
        />

        <div className="space-y-5 text-base sm:text-lg leading-relaxed text-ink-soft">
          <p>
            STEM MEDICA is an Ethiopian registered company engaged in the distribution of medical supplies, devices, and equipment across Ethiopia, providing high-quality and affordable healthcare solutions. Established in 2023 G.C., the company operates nationwide to promote technology transfer.
          </p>
          <p>
            Founded by biomedical engineer and healthcare entrepreneur Mr. Geremew Zewdie, the organization pairs technical engineering rigor with modern equipment distribution — working closely with public and private hospitals, specialized clinics, and educational institutions.
          </p>
          <p>
            We believe in teamwork and mutual benefit, ensuring all supplied products meet modern healthcare standards at fair, competitive prices backed by certified biomedical support.
          </p>
          <Link prefetch={false} href="/about" className="group mt-2 inline-flex min-h-13 items-center gap-4 rounded-full bg-scarlet py-2 pl-6 pr-2 text-sm font-semibold text-white transition-colors hover:bg-vital">
            Read our full story
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-scarlet transition-transform duration-300 group-hover:rotate-45">
              <ArrowUpRight size={17} aria-hidden="true" />
            </span>
          </Link>
        </div>
      </div>

      <div className="reveal-stagger mt-16 grid gap-5 sm:grid-cols-3 lg:mt-20">
        {/* Vision Card - Deep Navy Blue */}
        <div className="reveal group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-navy p-7 text-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-scarlet/40 hover:shadow-xl">
          {/* Subtle watermark outline icon */}
          <div className="pointer-events-none absolute -bottom-5 -right-5 text-white/[0.04] transition-all duration-300 group-hover:scale-105 group-hover:text-white/[0.07]" aria-hidden="true">
            <Compass size={120} strokeWidth={1.2} />
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="flex size-11 items-center justify-center rounded-xl bg-white/10 text-white shadow-2xs transition-all duration-300 group-hover:scale-105 group-hover:bg-scarlet">
                <Compass size={22} aria-hidden="true" />
              </span>
              <span className="text-[12px] font-semibold uppercase tracking-wider text-slate-300/80">
                01 // Vision
              </span>
            </div>

            <h3 className="font-display mt-5 text-2xl font-bold tracking-tight text-white">
              Our Vision
            </h3>

            <p className="mt-3 text-[15px] leading-relaxed text-slate-200">
              To become a <span className="font-semibold text-white">renowned supplier</span> of medical devices in Ethiopia and expand into <span className="font-semibold text-white">local manufacturing</span>, driving lasting healthcare growth.
            </p>
          </div>
        </div>

        {/* Mission Card - Deep Navy Blue */}
        <div className="reveal group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-navy p-7 text-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-scarlet/40 hover:shadow-xl">
          {/* Subtle watermark outline icon */}
          <div className="pointer-events-none absolute -bottom-5 -right-5 text-white/[0.04] transition-all duration-300 group-hover:scale-105 group-hover:text-white/[0.07]" aria-hidden="true">
            <Target size={120} strokeWidth={1.2} />
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="flex size-11 items-center justify-center rounded-xl bg-white/10 text-white shadow-2xs transition-all duration-300 group-hover:scale-105 group-hover:bg-scarlet">
                <Target size={22} aria-hidden="true" />
              </span>
              <span className="text-[12px] font-semibold uppercase tracking-wider text-slate-300/80">
                02 // Mission
              </span>
            </div>

            <h3 className="font-display mt-5 text-2xl font-bold tracking-tight text-white">
              Our Mission
            </h3>

            <p className="mt-3 text-[15px] leading-relaxed text-slate-200">
              Delivering <span className="font-semibold text-white">high-quality medical equipment</span> with speed and integrity — meeting clinical demand, <span className="font-semibold text-white">transferring know-how</span>, and ensuring dependable service.
            </p>
          </div>
        </div>

        {/* Values Card - Deep Navy Blue */}
        <div className="reveal group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-navy p-7 text-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-scarlet/40 hover:shadow-xl">
          {/* Subtle watermark outline icon */}
          <div className="pointer-events-none absolute -bottom-5 -right-5 text-white/[0.04] transition-all duration-300 group-hover:scale-105 group-hover:text-white/[0.07]" aria-hidden="true">
            <Award size={120} strokeWidth={1.2} />
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="flex size-11 items-center justify-center rounded-xl bg-white/10 text-white shadow-2xs transition-all duration-300 group-hover:scale-105 group-hover:bg-scarlet">
                <Award size={22} aria-hidden="true" />
              </span>
              <span className="text-[12px] font-semibold uppercase tracking-wider text-slate-300/80">
                03 // Values
              </span>
            </div>

            <h3 className="font-display mt-5 text-2xl font-bold tracking-tight text-white">
              Core Values
            </h3>

            <p className="mt-3 text-[15px] leading-relaxed text-slate-200">
              <span className="font-semibold text-white">Customer satisfaction</span>, clinical reliability, <span className="font-semibold text-white">ethical honesty</span>, mutual respect, professional efficiency, and continuous innovation.
            </p>
          </div>
        </div>
      </div>

      <QuietTrace className="mt-14 h-12 w-full lg:mt-16" />
    </div>
  </section>;
}
