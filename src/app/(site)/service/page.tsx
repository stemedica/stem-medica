import type { Metadata } from "next";
import { Wrench, GraduationCap, PackageSearch, Headset } from "lucide-react";
import { Section } from "@/components/Section";
import { Button } from "@/components/Button";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Service & Support",
  description:
    "How STEM MEDICA helps you choose, install and use medical equipment, with warranty and ongoing support.",
};

const stages = [
  { n: "01", icon: Wrench, title: "Installation", body: "Complete medical equipment installation, coordinated with delivery and shipping services for your facility." },
  { n: "02", icon: GraduationCap, title: "Training", body: "Practical product training for health professionals and biomedical engineers who use and maintain the equipment." },
  { n: "03", icon: PackageSearch, title: "Spare parts", body: "Supply of spare parts, consumables and accessories used across the medical device industry." },
  { n: "04", icon: Headset, title: "Technical support", body: "Ongoing technical assistance to help your team use our products effectively and respond to equipment issues." },
];

export default function ServicePage() {
  return (
    <>
      <Section
        headingLevel="h1"
        title="Service beyond delivery"
        lede="We install equipment, train teams and provide the parts and technical support needed for dependable daily use."
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
