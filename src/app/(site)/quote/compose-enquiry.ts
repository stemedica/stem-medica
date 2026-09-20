import type { FormCopy } from "./form-copy";

/**
 * Build the email draft the visitor's own mail app opens.
 *
 * Nothing is sent from the browser and nothing is stored: their mail app opens
 * with the message prepared and they press send. The mail then arrives from
 * their own address, so replying goes straight back to them.
 */

/**
 * Windows' shell and several mail clients truncate a mailto URL at around
 * 2 KB. Staying under keeps the draft intact instead of losing the end of the
 * notes silently, which is worse than trimming visibly.
 */
export const MAILTO_LIMIT = 1800;

export type EnquiryFields = Record<string, string>;

/** Aligned plain text: mailto cannot carry HTML, so alignment is the formatting. */
export function composeBody(fields: EnquiryFields, variant: FormCopy) {
  const rows: [string, string][] = [
    [variant.fields[0].label, fields.facility ?? ""],
    ["Contact", fields.contact ?? ""],
    ["Phone", fields.phone ?? ""],
    ["Email", fields.email?.trim() || "not given"],
    [variant.mainLabel, fields.equipment ?? ""],
  ];
  if (variant.showQuantity && fields.quantity?.trim()) rows.push(["Quantity", fields.quantity.trim()]);

  const width = Math.max(...rows.map(([label]) => label.length));
  const lines = [variant.heading, "", ...rows.map(([label, value]) => `${label.padEnd(width)} : ${value.trim()}`)];

  const notes = fields.notes?.trim();
  if (notes) lines.push("", "Notes:", notes);
  return lines.join("\n");
}

export function composeSubject(fields: EnquiryFields, variant: FormCopy) {
  const who = (fields.facility ?? "").trim();
  return (who ? `${variant.subject}: ${who}` : variant.subject).slice(0, 180);
}

const build = (to: string, subject: string, body: string) =>
  `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

export function composeMailto(to: string, fields: EnquiryFields, variant: FormCopy) {
  const subject = composeSubject(fields, variant);
  let body = composeBody(fields, variant);
  let href = build(to, subject, body);

  if (href.length > MAILTO_LIMIT) {
    // Trim the notes until it fits, and say so, rather than letting the client
    // cut the message mid-word with no indication.
    const notes = fields.notes?.trim() ?? "";
    const withoutNotes = build(to, subject, composeBody({ ...fields, notes: "" }, variant));
    const room = MAILTO_LIMIT - withoutNotes.length - 120;
    const keep = room > 0 ? notes.slice(0, room) : "";
    body = composeBody(
      { ...fields, notes: keep ? `${keep}…\n\n(Shortened to fit. Ask us for the rest.)` : "" },
      variant,
    );
    href = build(to, subject, body);
  }
  return { href, subject, body };
}
