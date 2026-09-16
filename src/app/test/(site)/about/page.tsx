import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/Section";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: "STEM MEDICA — medical equipment supply, installation and support in Ethiopia.",
};

export default function AboutPage() {
  return <Section headingLevel="h1" index="01" label="About STEM MEDICA"
    title="Equipment for your facility. Support for your team."
    lede="Medical equipment supply, installation and support, based in Addis Ababa, Ethiopia.">
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
      <div className="max-w-[65ch] space-y-5 text-base leading-relaxed text-ink-soft">
        <p>STEM MEDICA works with healthcare facilities on their equipment requirements. Browse our catalogue by department, or contact us about equipment you cannot find online.</p>
        <p>Tell us your intended use, quantities and installation location. Our team can discuss specifications, availability and the support needed for your order.</p>
        <p>Pricing is confirmed through a quotation, not an automatic online checkout. Request a proforma with the equipment and terms your procurement team needs to review.</p>
        <div className="flex flex-wrap gap-3 pt-2"><Link href="/test/products" className="btn-primary min-h-11">Browse equipment</Link><Link href="/test/contact" className="btn-outline min-h-11">Contact the team</Link></div>
      </div>
      <aside className="plate p-6">
        <h2 className="text-lg font-semibold text-navy">Get in touch</h2>
        <p className="mt-3 text-sm text-ink-soft">{site.city}</p>
        <a href={`tel:${site.phoneIntl}`} className="mt-3 flex min-h-11 items-center text-navy underline">{site.phone}</a>
        <a href={`mailto:${site.email}`} className="flex min-h-11 items-center text-navy underline">{site.email}</a>
        <Link href="/test/service" className="mt-3 inline-flex min-h-11 items-center text-sm text-navy underline">Service &amp; support</Link>
      </aside>
    </div>
  </Section>;
}
