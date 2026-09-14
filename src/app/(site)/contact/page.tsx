import type { Metadata } from "next";
import { Phone, MessageCircle, Mail, Link2 } from "lucide-react";
import { Section } from "@/components/Section";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Call ${site.phone} or email ${site.email}. STEM MEDICA, Addis Ababa.`,
};

/** Channels and values are real. Notes are LOREM placeholder. */
const channels = [
  { icon: Phone, label: "Phone", value: site.phone, href: `tel:${site.phoneIntl}`, note: "Lorem ipsum dolor sit amet." },
  { icon: MessageCircle, label: "WhatsApp", value: site.phoneIntl, href: site.whatsapp, note: "Consectetur adipiscing elit." },
  { icon: Mail, label: "Email", value: site.email, href: `mailto:${site.email}`, note: "Sed do eiusmod tempor incididunt." },
  { icon: Link2, label: "LinkedIn", value: "/company/stem-medica", href: site.linkedin, note: "Ut labore et dolore magna." },
];

export default function ContactPage() {
  return (
    <Section
      index="01"
      label="Contact"
      meta={site.city}
      title="Call us, it's faster than a form"
      lede="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    >
      <div className="mt-12 grid gap-px border border-hair bg-hair sm:grid-cols-2">
        {channels.map(({ icon: Icon, label, value, href, note }) => (
          <a
            key={label}
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
            className="group relative bg-white p-6 transition-colors hover:bg-paper"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="label text-steel">{label}</div>
              <Icon size={17} className="shrink-0 text-navy" aria-hidden="true" />
            </div>
            <div className="font-display wdth-n mt-3 text-lg font-semibold break-words transition-colors group-hover:text-navy">
              {value}
            </div>
            <p className="mt-1.5 text-sm text-ink-soft">{note}</p>
            <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-scarlet transition-all duration-400 ease-[cubic-bezier(.22,.61,.36,1)] group-hover:w-full" />
          </a>
        ))}
      </div>

      <aside className="plate ticks mt-10 p-6">
        <div className="label text-steel">Procurement</div>
        <h2 className="font-display wdth-n mt-2.5 text-xl font-semibold">Requesting a proforma</h2>
        <p className="mt-2 max-w-[58ch] text-[15px] leading-relaxed text-ink-soft">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam.
        </p>
      </aside>
    </Section>
  );
}
