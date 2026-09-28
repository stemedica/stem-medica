import type { Metadata } from "next";
import { Stethoscope, Wrench, GraduationCap, Headset } from "lucide-react";
import { Section } from "@/components/Section";
import { Button } from "@/components/Button";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/service" },
  title: "Service & Support",
  description:
    "How STEM MEDICA helps you choose, install and use medical equipment, with warranty and ongoing support.",
};

const stages = [
  { n: "01", icon: Stethoscope, title: "Consultation", body: "Expert clinical planning, equipment selection and facility needs assessment tailored to your medical requirements." },
  { n: "02", icon: Wrench, title: "Installation", body: "Complete medical equipment installation, coordinated with delivery and precision calibration for your facility." },
  { n: "03", icon: GraduationCap, title: "Training", body: "Practical product training for health professionals and biomedical engineers who use and maintain the equipment." },
  { n: "04", icon: Headset, title: "Technical support", body: "Ongoing technical assistance to help your team use our products effectively and respond to equipment issues." },
];

export default function ServicePage() {
  return (
    <>
      <Section
        headingLevel="h1"
        title="Service beyond delivery"
        lede="From clinical planning and installation to staff training and ongoing technical support, our services ensure dependable daily use."
      >
        <ol className="mt-12 border-t border-hair">
          {stages.map(({ n, icon: Icon, title, body }) => (
            <li key={n} className="grid gap-4 border-b border-hair py-6 sm:grid-cols-[64px_minmax(180px,.7fr)_1fr] sm:items-start sm:gap-6 sm:py-7">
              <div className="flex items-center gap-3 text-navy sm:flex-col sm:items-start sm:gap-2">
                <span className="stamp text-2xl tabular-nums">{n}</span>
                <Icon size={20} strokeWidth={1.7} aria-hidden="true" className="text-scarlet" />
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
        {/* Manufacturers get /partnership, not /quote: the quote form asks for
            facility, equipment needed and quantity, which is a hospital buying,
            not a supplier offering to distribute. Same pipeline, kind=partnership. */}
        <div className="mt-9 flex flex-wrap gap-3">
          <Button href="/partnership">Send partnership details</Button>
          <Button href={site.linkedin} variant="onDark">LinkedIn</Button>
        </div>
        <p className="mt-4 text-sm text-white/60">
          Include your product range, certifications and the territory you are
          looking to cover.
        </p>
      </Section>
    </>
  );
}
