import type { Metadata } from "next";
import { Search, FileText, Truck, GraduationCap, ShieldCheck, Headset } from "lucide-react";
import { Section } from "@/components/Section";
import { Button } from "@/components/Button";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Service & Support",
  description:
    "How STEM MEDICA supports equipment after delivery: site survey, installation, commissioning, user training, spares and warranty.",
};

const stages = [
  { n: "01", icon: Search, title: "Site requirements", body: "Share the installation location, available space and utilities so we can discuss the equipment’s requirements." },
  { n: "02", icon: FileText, title: "Quotation & proforma", body: "Request a written quotation with equipment details, quantities, pricing and terms for your procurement review." },
  { n: "03", icon: Truck, title: "Delivery & installation", body: "Confirm the delivery schedule and installation scope with our team before placing your order." },
  { n: "04", icon: GraduationCap, title: "User training", body: "Discuss training needs for your clinical and technical teams as part of the supply agreement." },
  { n: "05", icon: ShieldCheck, title: "Warranty & spares", body: "Ask about the warranty terms, consumables and spare parts available for your selected equipment." },
  { n: "06", icon: Headset, title: "Ongoing support", body: "For a support enquiry, send the equipment model, serial number and a description of the issue." },
];

export default function ServicePage() {
  return (
    <>
      <Section
        headingLevel="h1"
        index="01"
        label="Service & support"
        meta="06 stages"
        title="What happens after the purchase order"
        lede="Plan the support your facility needs, from equipment selection to use. Services and timelines are confirmed for each order."
      >
        <ol className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {stages.map(({ n, icon: Icon, title, body }) => (
            <li key={n} className="plate plate-hover lift relative p-6">
              <span className="stamp absolute right-5 top-5 text-3xl text-navy/10">
                {n}
              </span>
              <span className="flex h-11 w-11 items-center justify-center border border-hair bg-paper text-navy">
                <Icon size={21} aria-hidden="true" />
              </span>
              <h2 className="font-display wdth-n mt-5 text-lg font-semibold">{title}</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section
        tone="dark"
        index="02"
        label="For manufacturers"
        title="Looking for Ethiopian distribution?"
        lede="Introduce your equipment range and share your distribution requirements with the STEM MEDICA team."
      >
        <div className="mt-9 flex flex-wrap gap-3">
          <Button href={`mailto:${site.email}`}>Email {site.email}</Button>
          <Button href={site.linkedin} variant="onDark">LinkedIn</Button>
        </div>
      </Section>
    </>
  );
}
