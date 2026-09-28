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
const LIGHT: Record<Availability, { text: string; surface: string }> = {
  "In stock, Addis Ababa": { text: "text-ok", surface: "bg-ok-tint" },
  "Indent order": { text: "text-wait", surface: "bg-wait-tint" },
  "On request": { text: "text-navy", surface: "bg-navy-tint" },
};

/** On navy the ink-weight hues fall below contrast, so the lifted pair is used. */
const DARK: Record<Availability, { text: string }> = {
  "In stock, Addis Ababa": { text: "text-ok-lift" },
  "Indent order": { text: "text-wait-lift" },
  "On request": { text: "text-white/70" },
};

const LABEL: Record<Availability, string> = {
  "In stock, Addis Ababa": "In stock",
  "Indent order": "Indent order",
  "On request": "On request",
};

export function AvailabilityTag({ availability, tone = "light", className = "" }: {
  availability: Availability;
  tone?: "light" | "dark";
  className?: string;
}) {
  const label = LABEL[availability] ?? availability;

  if (tone === "dark") {
    const dark = DARK[availability] ?? DARK["On request"];
    return (
      <span className={`inline-flex items-center font-medium ${dark.text} ${className}`}>
        {label}
      </span>
    );
  }
  const light = LIGHT[availability] ?? LIGHT["On request"];
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${light.surface} ${light.text} ${className}`}>
      {label}
    </span>
  );
}
