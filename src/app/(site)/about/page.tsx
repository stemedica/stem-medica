import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/Section";
import { LocationMap } from "@/components/LocationMap";

export const metadata: Metadata = {
  title: "About",
  description: "Learn how STEM MEDICA is improving access to quality, affordable medical equipment across Ethiopia.",
};

export default function AboutPage() {
  return <Section headingLevel="h1"
    title="Closing the healthcare technology gap"
    lede="STEM MEDICA is a registered medical importing company distributing medical supplies, devices and equipment across Ethiopia.">
    <div className="mt-8">
      <div className="max-w-[65ch] space-y-5 text-base leading-relaxed text-ink-soft">
        <p>We focus on quality and affordability so more hospitals, clinics, laboratories and health professionals can access the technology and supplies they need.</p>
        <p>Ethiopia faces a significant gap in healthcare technology and access to quality medical supplies. We work with health facilities and trusted partners to help address that need.</p>
        <p>Our mission is to advance medical research and development and improve healthcare outcomes across Ethiopia through collaboration, innovation and dependable product support.</p>
        <div className="action-stack pt-2"><Link href="/products" className="btn-primary min-h-11">Browse equipment</Link><Link href="/contact" className="btn-outline min-h-11">Contact the team</Link></div>
      </div>
    </div>
    <LocationMap />
  </Section>;
}
