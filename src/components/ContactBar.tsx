import { site } from "@/lib/site";

/** Fixed on the thumb from the first scroll: the phone number is the funnel. */
export function ContactBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-px bg-ink md:hidden">
      <a
        href={`tel:${site.phoneIntl}`}
        className="label bg-scarlet py-4 text-center font-semibold text-white"
      >
        Call {site.phone}
      </a>
      <a
        href={site.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className="label bg-ink py-4 text-center font-semibold text-paper"
      >
        WhatsApp
      </a>
    </div>
  );
}
