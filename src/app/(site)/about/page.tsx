import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Award, Building2, ShieldCheck, Users } from "lucide-react";
import { V2Photo } from "@/components/V2";
import { LocationMap } from "@/components/LocationMap";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/about" },
  title: "About Us",
  description:
    "STEM MEDICA is an Ethiopian registered medical distributor established in 2023 G.C. by biomedical engineer Mr. Geremew Zewdie, providing quality and affordable healthcare technology across Ethiopia.",
};

const STATS = [
  { label: "Established", value: "2023 G.C.", detail: "Registered Ethiopian medical equipment distributor" },
  { label: "Startup Capital", value: "USD 100,000", detail: "Dedicated initial capital investment" },
  { label: "Leadership", value: "Biomedical Engineering", detail: "Technical rigor & clinical workflow expertise" },
  { label: "Coverage", value: "Nationwide", detail: "Delivering across all regions of Ethiopia" },
];

const PILLARS = [
  {
    icon: Building2,
    title: "Who We Serve",
    description:
      "Public and private hospitals, specialized clinics, primary health centers, educational institutions, and pharmacies across Ethiopia.",
  },
  {
    icon: Award,
    title: "Technology Transfer",
    description:
      "Bridging international medical technology with local healthcare needs, accompanied by expert installation, calibration, and training.",
  },
  {
    icon: Users,
    title: "Teamwork & Mutual Benefit",
    description:
      "Dedicated, experienced professionals committed to honesty, respect, and ensuring employees, clients, and suppliers grow together.",
  },
  {
    icon: ShieldCheck,
    title: "Standards & Fair Pricing",
    description:
      "All supplied devices meet modern international healthcare standards, offered at fair, competitive prices with certified warranty backing.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero & Company Foundation */}
      <section aria-labelledby="about-title" className="border-b border-hair bg-white px-5 py-14 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-sm text-steel">
            <Link href="/" className="inline-flex min-h-11 items-center text-navy underline underline-offset-4">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">About</span>
          </nav>

          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-scarlet">
            <span className="h-2 w-2 rounded-full bg-scarlet" aria-hidden="true" />
            Company Profile & History
          </div>

          <h1
            id="about-title"
            className="reveal font-display wdth-w mt-3 max-w-[20ch] text-[clamp(2.4rem,5.2vw,4.4rem)] font-semibold leading-[1.02] tracking-[-.035em] text-navy text-balance"
          >
            Putting quality in the front line<span className="text-scarlet">.</span>
          </h1>

          <div className="reveal mt-12 grid gap-10 lg:mt-16 lg:grid-cols-2 lg:items-start lg:gap-16">
            <V2Photo
              label="STEM MEDICA facility and medical equipment"
              rounded={false}
              className="aspect-[4/3] w-full rounded-2xl lg:aspect-[5/4]"
            />

            <div className="space-y-5 text-base sm:text-lg leading-relaxed text-ink-soft">
              <p className="font-medium text-navy">
                STEM MEDICA is an Ethiopian registered company engaged in the distribution of medical supplies, devices, and equipment across Ethiopia, providing high-quality and affordable healthcare solutions. The company was established in 2023 G.C. with a startup capital of USD 100,000.
              </p>
              <p>
                The founder of the organization, Mr. Geremew Zewdie, is a biomedical engineer by profession as well as an entrepreneur with a strong vision for the medical technology sector. His technical background and passion for healthcare innovation inspired the establishment of STEM MEDICA with the goal of promoting technology transfer and improving access to modern medical equipment in Ethiopia.
              </p>
              <p>
                STEM MEDICA works closely with healthcare professionals, government institutions, private organizations, and other stakeholders in the healthcare sector. The company aims to support these partners by introducing modern technologies and providing reliable medical equipment solutions that respond to the evolving needs of healthcare institutions.
              </p>
            </div>
          </div>

          {/* Quick Metrics & Facts */}
          <div className="reveal mt-14 grid gap-4 border-t border-hair pt-10 sm:grid-cols-2 lg:grid-cols-4 lg:mt-16">
            {STATS.map(({ label, value, detail }) => (
              <div key={label} className="rounded-xl border border-hair bg-paper p-5">
                <span className="text-xs font-semibold uppercase tracking-wider text-steel">{label}</span>
                <div className="font-display mt-2 text-xl font-bold tracking-tight text-navy">{value}</div>
                <p className="mt-1 text-xs leading-relaxed text-ink-soft">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nationwide Operations, Customer Reach & Values */}
      <section aria-labelledby="operations-title" className="border-b border-hair bg-paper px-5 py-14 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="reveal max-w-3xl">
            <h2
              id="operations-title"
              className="font-display wdth-w text-[clamp(2rem,4.2vw,3.2rem)] font-semibold leading-[1.05] tracking-[-.035em] text-navy text-balance"
            >
              Serving healthcare providers nationwide<span className="text-scarlet">.</span>
            </h2>
            <div className="mt-6 space-y-4 text-base sm:text-lg leading-relaxed text-ink-soft">
              <p>
                Currently, the company serves a wide range of customers including public and private hospitals, specialized clinics, health centers, educational institutions, and pharmacies. STEM MEDICA operates throughout Ethiopia and ensures timely delivery of products to meet customer expectations while continuously exploring innovative technologies that improve healthcare services.
              </p>
              <p>
                STEM MEDICA strongly believes in teamwork and mutual benefit, ensuring that employees, customers, and suppliers grow together. The company&apos;s professional staff are dedicated, experienced, and committed to serving customers with respect, honesty, and professionalism. All supplied products meet modern healthcare standards and are offered at fair and competitive prices.
              </p>
            </div>
          </div>

          {/* Core Pillars */}
          <div className="reveal-stagger mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PILLARS.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="reveal group flex flex-col justify-between rounded-2xl border border-white/10 bg-navy p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:shadow-xl"
              >
                <div>
                  <span className="flex size-11 items-center justify-center rounded-xl bg-white/10 text-white shadow-2xs transition-all duration-300 group-hover:scale-105 group-hover:bg-scarlet">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <h3 className="font-display mt-5 text-lg font-bold text-white">{title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-slate-200">{description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="reveal mt-10 flex flex-wrap gap-4">
            <Link
              href="/products"
              className="inline-flex min-h-12 items-center gap-3 rounded-full border border-navy px-6 text-sm font-semibold text-navy transition-colors hover:bg-navy hover:text-white"
            >
              Browse equipment <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
            <Link
              href="/#services"
              className="inline-flex min-h-12 items-center gap-2.5 text-sm font-semibold text-navy underline underline-offset-4"
            >
              How we support you <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* Location in Addis Ababa */}
      <section aria-labelledby="find-us" className="border-b border-hair bg-white px-5 py-14 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="reveal flex flex-wrap items-end justify-between gap-5">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-scarlet">Head Office</div>
              <h2
                id="find-us"
                className="font-display wdth-w mt-2 max-w-[16ch] text-[clamp(2rem,4.2vw,3.2rem)] font-semibold leading-[1.05] tracking-[-.035em] text-navy text-balance"
              >
                Find us in Addis Ababa<span className="text-scarlet">.</span>
              </h2>
            </div>
            <p className="max-w-[40ch] text-base leading-relaxed text-ink-soft">{site.address}</p>
          </div>
          <div className="reveal mt-10">
            <LocationMap />
          </div>
        </div>
      </section>

      {/* Quotation CTA Banner */}
      <section className="px-5 py-14 sm:px-6 lg:py-20">
        <div className="reveal mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-5 rounded-2xl border border-hair bg-paper p-6 sm:p-8">
          <div>
            <h2 className="font-display text-xl font-bold text-navy">Tell us what your facility needs</h2>
            <p className="mt-1.5 max-w-[56ch] text-base leading-relaxed text-ink-soft">
              Send your equipment list with quantities and our biomedical team will prepare a formal proposal and pricing.
            </p>
          </div>
          <Link
            href="/quote"
            className="inline-flex min-h-12 shrink-0 items-center gap-3 rounded-full bg-scarlet px-6 text-sm font-semibold text-white transition-colors hover:bg-vital"
          >
            Request a quote <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
