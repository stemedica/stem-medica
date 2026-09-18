import { site } from "@/lib/site";

/** Fixed on the thumb from the first scroll: the phone number is the funnel. */
export function ContactBar() {
  return (
    <nav aria-label="Quick contact" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-px bg-ink pb-[env(safe-area-inset-bottom)] lg:hidden">
      <a
        href={`tel:${site.phoneIntl}`}
        className="label bg-navy py-4 text-center font-semibold text-white hover:bg-navy-deep focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white"
      >
        Call {site.phone}
      </a>
      <a
        href={site.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className="label bg-ink py-4 text-center font-semibold text-paper hover:bg-navy-deep focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white"
      >
        WhatsApp
      </a>
    </nav>
  );
}
