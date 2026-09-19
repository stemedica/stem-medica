import { MapPin, ExternalLink } from "lucide-react";
import { site } from "@/lib/site";

/**
 * Google Maps embed for the Addis Ababa office.
 *
 * Mobile first: the map is taller than it is wide on a phone, where a squat
 * strip is unusable, and widens to 16:9 from the small breakpoint up. The
 * directions link sits outside the frame because tapping through an embedded
 * map on a phone is fiddly and most visitors just want turn-by-turn.
 *
 * Requires `frame-src https://www.google.com` in the CSP; without it the
 * iframe is blocked and renders as an empty box with no console error that
 * points at the cause.
 */
export function LocationMap() {
  return (
    <section aria-labelledby="visit-us" className="mt-12">
      <h2 id="visit-us" className="text-lg font-semibold text-navy">Visit us</h2>

      <p className="mt-3 flex max-w-[52ch] items-start gap-2 text-sm leading-relaxed text-ink-soft">
        <MapPin size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-navy" />
        {site.address}
      </p>

      <div className="mt-5 overflow-hidden rounded-2xl border border-hair bg-paper-2">
        <iframe
          src={site.map.embed}
          title="STEM MEDICA office location on Google Maps"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="block aspect-[4/3] w-full border-0 sm:aspect-[16/9]"
        />
      </div>

      <a
        href={site.map.directions}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-navy underline"
      >
        Get directions
        <ExternalLink size={14} aria-hidden="true" />
      </a>
    </section>
  );
}
