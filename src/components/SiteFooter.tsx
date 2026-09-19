import Link from "next/link";
import { Phone, Mail, MapPin, FileText } from "lucide-react";
import { Logo } from "./Logo";
import { WhatsAppIcon } from "./WhatsAppIcon";
import { nav, site } from "@/lib/site";

/** Every footer link is underlined so it reads as a link on the dark ground. */
const link = "underline underline-offset-4 decoration-on-navy/40 hover:decoration-white hover:text-white transition-colors";

export function SiteFooter() {
  return (
    <footer className="bg-navy-deep pb-[calc(4rem+env(safe-area-inset-bottom))] text-on-navy lg:pb-0">
      <div className="mx-auto max-w-6xl px-5 py-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1.1fr]">
          <div>
            <Logo height={34} onDark />
            <p className="mt-3 max-w-[42ch] text-sm leading-relaxed text-on-navy/70">
              {site.description}
            </p>
          </div>

          <div>
            <div className="label text-on-navy/65">Company</div>
            {/* The quote CTA is the red link in Contact, so it is not repeated here. */}
            <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
              {nav.filter((item) => !("cta" in item)).map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={`flex min-h-11 items-center text-sm text-on-navy/80 ${link}`}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="label text-on-navy/65">Contact</div>

            {/* Phones lead: they are the channel that actually gets answered. */}
            <ul className="mt-2 space-y-1">
              {[
                { label: site.phone, href: `tel:${site.phoneIntl}` },
                { label: site.secondaryPhone, href: `tel:${site.secondaryPhoneIntl}` },
              ].map((tel) => (
                <li key={tel.href}>
                  <a
                    href={tel.href}
                    className="group flex min-h-11 items-center gap-2.5 text-white"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 transition-colors group-hover:bg-white/20">
                      <Phone size={13} aria-hidden="true" />
                    </span>
                    <span className="font-mono text-base font-semibold tracking-wide tabular-nums underline underline-offset-4 decoration-white/40 group-hover:decoration-white">
                      {tel.label}
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            <ul className="mt-2 space-y-1 text-sm">
              <li>
                <a
                  href={site.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex min-h-11 items-center gap-2.5 text-on-navy/85 ${link}`}
                >
                  <span className="text-[#25D366]"><WhatsAppIcon size={17} /></span>
                  WhatsApp
                </a>
              </li>
              <li>
                <a href={`mailto:${site.email}`} className={`flex min-h-11 items-center gap-2.5 break-all text-on-navy/85 ${link}`}>
                  <Mail size={16} aria-hidden="true" className="shrink-0" />
                  {site.email}
                </a>
              </li>
              <li>
                <Link
                  href="/quote"
                  className="flex min-h-11 items-center gap-2.5 font-semibold text-scarlet-lift underline underline-offset-4 decoration-scarlet-lift/60 transition-colors hover:text-white hover:decoration-white"
                >
                  <FileText size={16} aria-hidden="true" className="shrink-0" />
                  Request a quote
                </Link>
              </li>
              <li className="flex items-start gap-2.5 pt-1 text-on-navy/60">
                <MapPin size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
                <span className="leading-relaxed">{site.address}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="label mt-7 flex flex-wrap justify-between gap-3 border-t border-on-navy/20 pt-4 text-on-navy/65">
          <span>© {new Date().getFullYear()} {site.legalName}</span>
        </div>
      </div>
    </footer>
  );
}
