import type { Metadata } from "next";
import { ClipboardList, Mail, Handshake } from "lucide-react";
import { Section } from "@/components/Section";
import { site } from "@/lib/site";
import Link from "next/link";

export const metadata: Metadata = {
  alternates: { canonical: "/contact" },
  title: "Contact",
  description: `Email ${site.email}, request an equipment quotation, or connect with STEM MEDICA.`,
};

const channels = [
  { icon: Mail, label: "Email", value: site.email, href: `mailto:${site.email}`, note: "Send product lists, partnership details or support questions." },
  { icon: ClipboardList, label: "Quotation request", accent: true, value: "Send equipment details", href: "/quote", note: "Your request is saved for our team to review and follow up." },
  { icon: Handshake, label: "Distribution partnership", value: "Manufacturers & exporters", href: "/partnership", note: "Selling medical equipment? Tell us what you make and the partner you need." },
];

export default function ContactPage() {
  return (
    <Section
      headingLevel="h1"
      title="Let’s advance healthcare together"
      lede="Contact our team for medical equipment, quotations, installation, training or technical support."
    >
      <div className="mt-12 grid gap-px border border-hair bg-hair sm:grid-cols-3">
        {channels.map(({ icon: Icon, label, value, href, note, accent }) => (
          <a
            key={label}
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
            className="group relative bg-white p-6 transition-colors hover:bg-paper"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="label text-steel">{label}</div>
              <span className={`shrink-0 ${accent ? "text-scarlet" : "text-navy"}`}>
                <Icon size={17} aria-hidden="true" />
              </span>
            </div>
            <div className={`font-display wdth-n mt-3 break-words text-lg font-semibold transition-colors ${
              accent ? "text-scarlet" : "text-ink group-hover:text-navy"
            } ${href.startsWith("tel:") ? "font-mono tabular-nums" : ""}`}>
              {value}
            </div>
            <p className="mt-1.5 text-sm text-ink-soft">{note}</p>
            <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-scarlet transition-all duration-400 ease-[cubic-bezier(.22,.61,.36,1)] group-hover:w-full" />
          </a>
        ))}
      </div>

      <aside className="plate ticks mt-10 p-6">
        <h2 className="font-display wdth-n text-xl font-semibold">Need a proforma invoice?</h2>
        <p className="mt-2 max-w-[62ch] text-base leading-relaxed text-ink-soft">
          Send your organization name, equipment list, quantities and delivery location. We’ll confirm the details before preparing the document.
        </p>
        <Link href="/quote" className="btn-primary mt-5 min-h-11">Request a quotation</Link>
      </aside>
    </Section>
  );
}
