import type { Metadata } from "next";
import { Logo } from "@/components/Logo";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Website maintenance | STEM MEDICA",
  description: "Our website is being updated. Contact STEM MEDICA for equipment enquiries and support.",
  robots: { index: false, follow: false },
};
export default function MaintenancePage() {
  return <main className="flex min-h-svh flex-col bg-navy-deep px-6 py-8 text-white sm:px-12 sm:py-12">
    <header className="mx-auto w-full max-w-5xl"><div className="inline-flex rounded-2xl bg-white px-5 py-3"><Logo height={44} /></div></header>
    <section aria-labelledby="maintenance-title" className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center py-16">
      <p className="text-xs font-medium uppercase tracking-[.18em] text-blue-200">STEM MEDICA · Website maintenance</p>
      <h1 id="maintenance-title" className="font-display mt-6 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">We’re making room<br />for what’s next.</h1>
      <p className="mt-6 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">Our website is being updated. For equipment enquiries, quotations or support, please contact our team.</p>
      <div className="mt-9 flex flex-wrap gap-3">
        <a href={`tel:${site.phoneIntl}`} className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-navy">Call {site.phone}</a>
        <a href={`mailto:${site.email}`} className="inline-flex min-h-12 items-center justify-center break-all rounded-full border border-white/40 px-6 py-3 text-sm font-medium text-white">{site.email}</a>
      </div>
    </section>
    <footer className="mx-auto w-full max-w-5xl border-t border-white/20 pt-5 text-sm text-white/65">Medical equipment. Human purpose. · Addis Ababa, Ethiopia</footer>
  </main>;
}
