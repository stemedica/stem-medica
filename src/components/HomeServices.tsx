import Link from "next/link";
import { Stethoscope, Wrench, GraduationCap, Headset, ArrowRight } from "lucide-react";

export const services = [
  {
    n: "01",
    title: "Consultation",
    icon: Stethoscope,
    description:
      "Expert clinical planning, workflow assessment, and procurement advisory to help health facilities select the right technology for their medical requirements.",
  },
  {
    n: "02",
    title: "Installation",
    icon: Wrench,
    description:
      "End-to-end on-site delivery, electrical and mechanical assembly, and precision calibration by certified biomedical engineers to guarantee clinical readiness.",
  },
  {
    n: "03",
    title: "Training",
    icon: GraduationCap,
    description:
      "Hands-on operational training for physicians, nursing staff, and biomedical technicians on proper device usage, hygiene protocols, and routine care.",
  },
  {
    n: "04",
    title: "Technical Support",
    icon: Headset,
    description:
      "Dedicated maintenance, rapid diagnostic response, and ongoing troubleshooting to maximize uptime and keep your equipment running smoothly.",
  },
] as const;

export function HomeServices() {
  return (
    <section
      id="services"
      aria-labelledby="services-heading"
      className="relative border-b border-hair bg-navy px-5 py-16 sm:px-6 lg:py-20 text-white"
    >
      <div className="mx-auto max-w-6xl">
        <div className="reveal flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-scarlet">
              <span className="h-1.5 w-1.5 rounded-full bg-scarlet animate-pulse" aria-hidden="true" />
              What we do
            </div>
            <h2
              id="services-heading"
              className="font-display wdth-w mt-2 max-w-[20ch] text-[clamp(2rem,4vw,3.2rem)] font-bold leading-[1.05] tracking-[-.035em] text-white text-balance"
            >
              The services we provide<span className="text-scarlet">.</span>
            </h2>
          </div>
          <p className="max-w-[46ch] text-sm leading-relaxed text-slate-300 sm:text-[15px]">
            Support that does not stop at delivery. We guide planning, install equipment, train your team, and provide ongoing technical assistance.
          </p>
        </div>

        <div className="reveal-stagger mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map(({ n, title, icon: Icon, description }) => (
            <article
              key={title}
              className="reveal group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.07] hover:shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold tabular-nums text-white/30 transition-colors duration-300 group-hover:text-scarlet">
                    {n}
                  </span>
                  <div className="flex size-11 items-center justify-center rounded-xl border border-scarlet/25 bg-scarlet/15 text-scarlet transition-all duration-300 group-hover:scale-105 group-hover:bg-scarlet group-hover:text-white">
                    <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
                  </div>
                </div>

                <h3 className="font-display mt-5 text-[18px] font-bold text-white">
                  {title}
                </h3>

                <p className="mt-2.5 text-[13.5px] leading-relaxed text-slate-300">
                  {description}
                </p>
              </div>

              {/* Bottom expanding accent line */}
              <span
                aria-hidden="true"
                className="absolute bottom-0 left-0 h-0.5 w-0 bg-scarlet transition-all duration-500 ease-[cubic-bezier(.22,.61,.36,1)] group-hover:w-full"
              />
            </article>
          ))}
        </div>

        <div className="reveal mt-10 flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-white/12 bg-white/[0.05] p-6 sm:p-7">
          <div>
            <h3 className="font-display text-base font-bold text-white sm:text-lg">
              Need assistance with your facility&apos;s equipment?
            </h3>
            <p className="mt-1 text-xs text-slate-300 sm:text-sm">
              Tell us what technology you need, or request a consultation for your hospital or clinic.
            </p>
          </div>
          <Link
            href="/quote"
            className="group inline-flex min-h-11 items-center gap-2.5 rounded-full bg-scarlet px-6 py-2.5 text-sm font-bold text-white shadow-xs transition-all duration-300 hover:bg-scarlet-deep hover:shadow-md"
          >
            Request consultation or quote
            <ArrowRight size={15} aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
