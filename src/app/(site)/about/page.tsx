import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/Section";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: "STEM MEDICA — medical equipment supply, installation and support in Ethiopia.",
};

export default function AboutPage() {
  return <Section headingLevel="h1"
    title="Equipment for your facility. Support for your team."
    lede="We supply medical equipment and help with installation and ongoing support across Ethiopia.">
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
      <div className="max-w-[65ch] space-y-5 text-base leading-relaxed text-ink-soft">
        <p>Browse equipment by department. If you cannot find what you need, tell us what you are looking for.</p>
        <p>Share how the equipment will be used, how many units you need and where they will be installed. We will help confirm the right model and support.</p>
        <p>We confirm prices and terms in a written quote. If your team needs a proforma invoice, ask for one when you contact us.</p>
        <div className="action-stack pt-2"><Link href="/products" className="btn-primary min-h-11">Browse equipment</Link><Link href="/contact" className="btn-outline min-h-11">Contact the team</Link></div>
      </div>
      <aside className="plate p-6">
        <h2 className="text-lg font-semibold text-navy">Get in touch</h2>
        <p className="mt-3 text-sm text-ink-soft">{site.city}</p>
        <a href={`tel:${site.phoneIntl}`} className="mt-3 flex min-h-11 items-center text-navy underline">{site.phone}</a>
        <Link href="/quote" className="flex min-h-11 items-center text-navy underline">Request a quote</Link>
        <Link href="/service" className="mt-3 inline-flex min-h-11 items-center text-sm text-navy underline">Service &amp; support</Link>
      </aside>
    </div>
  </Section>;
}
