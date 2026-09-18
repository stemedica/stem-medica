import type { Metadata } from "next";
import { Search, FileText, Truck, GraduationCap, ShieldCheck, Headset } from "lucide-react";
import { Section } from "@/components/Section";
import { Button } from "@/components/Button";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Service & Support",
  description:
    "How STEM MEDICA helps you choose, install and use medical equipment, with warranty and ongoing support.",
};

const stages = [
  { n: "01", icon: Search, title: "Tell us about the site", body: "Share where the equipment will be used and what space, power, water or other services are available." },
  { n: "02", icon: FileText, title: "Review the quote", body: "We’ll list the equipment, quantity, price and terms in writing. We can also provide a proforma invoice if needed." },
  { n: "03", icon: Truck, title: "Plan delivery and installation", body: "We’ll agree on delivery dates and who will handle installation before you order." },
  { n: "04", icon: GraduationCap, title: "Train your team", body: "Tell us who will use and maintain the equipment so the right training can be included." },
  { n: "05", icon: ShieldCheck, title: "Confirm warranty and parts", body: "We’ll explain the warranty and confirm which supplies and spare parts are available." },
  { n: "06", icon: Headset, title: "Get support", body: "Send the model, serial number and what went wrong. This helps us respond faster." },
];

export default function ServicePage() {
  return (
    <>
      <Section
        headingLevel="h1"
        title="Support from selection to daily use"
        lede="We can help you choose, install and use your equipment. The exact service and timing are agreed for each order."
      >
        <ol className="mt-12 border-t border-hair">
          {stages.map(({ n, icon: Icon, title, body }) => (
            <li key={n} className="grid gap-4 border-b border-hair py-6 sm:grid-cols-[64px_minmax(180px,.7fr)_1fr] sm:items-start sm:gap-6 sm:py-7">
              <div className="flex items-center gap-3 text-navy sm:flex-col sm:items-start sm:gap-2">
                <span className="stamp text-2xl tabular-nums">{n}</span>
                <Icon size={20} strokeWidth={1.7} aria-hidden="true" />
              </div>
              <h2 className="font-display wdth-n text-xl font-semibold leading-snug text-navy">{title}</h2>
              <p className="max-w-[62ch] text-base leading-relaxed text-ink-soft">{body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section
        tone="dark"
        title="Want to sell your equipment in Ethiopia?"
        lede="Tell us about your products and the kind of local partner you need."
      >
        <div className="mt-9 flex flex-wrap gap-3">
          <Button href="/quote">Send partnership details</Button>
          <Button href={site.linkedin} variant="onDark">LinkedIn</Button>
        </div>
      </Section>
    </>
  );
}
