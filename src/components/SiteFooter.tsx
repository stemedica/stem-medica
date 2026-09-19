import Link from "next/link";
import { Logo } from "./Logo";
import { nav, site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="bg-navy-deep pb-[calc(4rem+env(safe-area-inset-bottom))] text-on-navy lg:pb-0">
      <div className="mx-auto max-w-6xl px-5 py-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr]">
          <div>
            <Logo height={34} onDark />
            <p className="mt-3 max-w-[42ch] text-sm leading-relaxed text-on-navy/70">
              {site.description}
            </p>
          </div>

          <div>
            <div className="label text-on-navy/65">Company</div>
            <ul className="mt-1 flex flex-wrap gap-x-5">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-on-navy/80 hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="label text-on-navy/65">Contact</div>
            <ul className="mt-1 flex flex-wrap gap-x-5 font-mono text-sm text-on-navy/80">
              <li><a href={`tel:${site.phoneIntl}`} className="hover:text-white">{site.phone}</a></li>
              <li><a href={`tel:${site.secondaryPhoneIntl}`} className="hover:text-white">{site.secondaryPhone}</a></li>
              <li><a href={`mailto:${site.email}`} className="hover:text-white">{site.email}</a></li>
              <li><Link href="/quote" className="hover:text-white">Request a quote</Link></li>
              <li><a href={site.whatsapp} target="_blank" rel="noopener noreferrer" className="hover:text-white">WhatsApp</a></li>
              <li className="flex min-h-11 items-center text-on-navy/60">{site.address}</li>
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
