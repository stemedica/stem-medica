import type { Metadata } from "next";
import { Phone, MessageCircle, Mail, Link2 } from "lucide-react";
import { Section } from "@/components/Section";
import { site } from "@/lib/site";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact",
  description: `Call ${site.phone} or email ${site.email}. STEM MEDICA, Addis Ababa.`,
};

const channels = [
  { icon: Phone, label: "Phone", value: site.phone, href: `tel:${site.phoneIntl}`, note: "Talk to our team about equipment or support." },
  { icon: MessageCircle, label: "WhatsApp", value: site.phoneIntl, href: site.whatsapp, note: "Send your equipment requirements in a message." },
  { icon: Mail, label: "Email", value: site.email, href: `mailto:${site.email}`, note: "Share specifications, quantities and procurement documents." },
  { icon: Link2, label: "LinkedIn", value: "STEM MEDICA", href: site.linkedin, note: "Visit our company page. Opens in a new tab." },
];

export default function ContactPage() {
  return (
    <Section
      headingLevel="h1"
      index="01"
      label="Contact"
      meta={site.city}
      title="How can we help?"
      lede="Contact our Addis Ababa team for equipment enquiries, quotations and support. Choose the channel that works best for you."
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
          Include your facility name, equipment list, quantities and delivery location. Our team will confirm the details and prepare a proforma for your review.
        </p>
        <Link href="/quote" className="btn-primary mt-5 min-h-11">Request a quotation</Link>
      </aside>
    </Section>
  );
}
