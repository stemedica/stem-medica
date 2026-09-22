import type { CmsProduct } from "@/lib/cms-schema";

type Availability = CmsProduct["availability"];

/**
 * Availability, encoded rather than merely printed.
 *
 * Whether an item is on the shelf in Addis or has to be ordered in is the fact
 * most likely to change what a buyer does next, and it was rendering in the
 * same weight and colour as the brand name beside it.
 *
 * Colour is never the only carrier: each state keeps its own wording and a
 * dot, so the distinction survives greyscale printing and colour blindness.
 */
const LIGHT: Record<Availability, { text: string; surface: string; dot: string }> = {
  "In stock, Addis Ababa": { text: "text-ok", surface: "bg-ok-tint", dot: "bg-ok" },
  "Indent order": { text: "text-wait", surface: "bg-wait-tint", dot: "bg-wait" },
  "On request": { text: "text-navy", surface: "bg-navy-tint", dot: "bg-navy" },
};

/** On navy the ink-weight hues fall below contrast, so the lifted pair is used. */
const DARK: Record<Availability, { dot: string }> = {
  "In stock, Addis Ababa": { dot: "bg-ok-lift" },
  "Indent order": { dot: "bg-wait-lift" },
  "On request": { dot: "bg-white/70" },
};

export function AvailabilityTag({ availability, tone = "light", className = "" }: {
  availability: Availability;
  tone?: "light" | "dark";
  className?: string;
}) {
  if (tone === "dark") {
    const dark = DARK[availability] ?? DARK["On request"];
    return (
      <span className={`inline-flex items-center gap-2 ${className}`}>
        <span aria-hidden="true" className={`size-1.5 shrink-0 rounded-full ${dark.dot}`} />
        {availability}
      </span>
    );
  }
  const light = LIGHT[availability] ?? LIGHT["On request"];
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${light.surface} ${light.text} ${className}`}>
      <span aria-hidden="true" className={`size-1.5 shrink-0 rounded-full ${light.dot}`} />
      {availability}
    </span>
  );
}
