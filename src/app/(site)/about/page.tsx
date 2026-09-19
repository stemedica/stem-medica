import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/Section";
import { site } from "@/lib/site";
import { LocationMap } from "@/components/LocationMap";

export const metadata: Metadata = {
  title: "About",
  description: "Learn how STEM MEDICA is improving access to quality, affordable medical equipment across Ethiopia.",
};

export default function AboutPage() {
  return <Section headingLevel="h1"
    title="Closing the healthcare technology gap"
    lede="STEM MEDICA is a registered medical importing company distributing medical supplies, devices and equipment across Ethiopia.">
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
      <div className="max-w-[65ch] space-y-5 text-base leading-relaxed text-ink-soft">
        <p>We focus on quality and affordability so more hospitals, clinics, laboratories and health professionals can access the technology and supplies they need.</p>
        <p>Ethiopia faces a significant gap in healthcare technology and access to quality medical supplies. We work with health facilities and trusted partners to help address that need.</p>
        <p>Our mission is to advance medical research and development and improve healthcare outcomes across Ethiopia through collaboration, innovation and dependable product support.</p>
        <div className="action-stack pt-2"><Link href="/products" className="btn-primary min-h-11">Browse equipment</Link><Link href="/contact" className="btn-outline min-h-11">Contact the team</Link></div>
      </div>
      <aside className="plate p-6">
        <h2 className="text-lg font-semibold text-navy">Get in touch</h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">{site.address}</p>
        <a href={`tel:${site.phoneIntl}`} className="mt-3 flex min-h-11 items-center text-navy underline">{site.phone}</a>
        <a href={`tel:${site.secondaryPhoneIntl}`} className="flex min-h-11 items-center text-navy underline">{site.secondaryPhone}</a>
        <a href={`mailto:${site.email}`} className="flex min-h-11 items-center break-all text-navy underline">{site.email}</a>
        <Link href="/quote" className="flex min-h-11 items-center text-navy underline">Request a quote</Link>
        <Link href="/service" className="mt-3 inline-flex min-h-11 items-center text-sm text-navy underline">Service &amp; support</Link>
      </aside>
    </div>
    <LocationMap />
  </Section>;
}
