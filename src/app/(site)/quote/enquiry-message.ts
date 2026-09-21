import type { FormCopy } from "./form-copy";

export type EnquiryFields = Record<string, string | undefined>;

const escape = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Label/value pairs in the order they are read, so text and HTML cannot drift apart. */
export function enquiryRows(fields: EnquiryFields, variant: FormCopy): [string, string][] {
  const rows: [string, string][] = [
    [variant.fields[0].label, fields.facility ?? ""],
    ["Contact", fields.contact ?? ""],
    ["Phone", fields.phone ?? ""],
    ["Email", fields.email?.trim() || "not given"],
    [variant.mainLabel, fields.equipment ?? ""],
  ];
  if (variant.showQuantity && fields.quantity?.trim()) rows.push(["Quantity", fields.quantity.trim()]);
  return rows.map(([label, value]) => [label, value.trim()]);
}

export function enquirySubject(fields: EnquiryFields, variant: FormCopy) {
  const who = (fields.facility ?? "").trim();
  return (who ? `${variant.subject}: ${who}` : variant.subject).slice(0, 180);
}

/** Aligned plain text, for mail clients that prefer it and for quoting in replies. */
export function enquiryText(fields: EnquiryFields, variant: FormCopy) {
  const rows = enquiryRows(fields, variant);
  const width = Math.max(...rows.map(([label]) => label.length));
  const lines = [variant.heading, "", ...rows.map(([label, value]) => `${label.padEnd(width)} : ${value}`)];
  const notes = fields.notes?.trim();
  if (notes) lines.push("", "Notes:", notes);
  return lines.join("\n");
}

export function enquiryHtml(fields: EnquiryFields, variant: FormCopy) {
  const rows = enquiryRows(fields, variant)
    .map(([label, value]) =>
      `<tr><th align="left" style="padding:6px 16px 6px 0;color:#5b6472;font-weight:500;white-space:nowrap;vertical-align:top">${escape(label)}</th>`
      + `<td style="padding:6px 0;color:#0f172a">${escape(value)}</td></tr>`)
    .join("");
  const notes = fields.notes?.trim();
  return `<div style="font-family:ui-sans-serif,system-ui,sans-serif;font-size:15px;line-height:1.6;color:#0f172a">`
    + `<p style="margin:0 0 16px">${escape(variant.heading)}</p>`
    + `<table cellpadding="0" cellspacing="0" style="border-collapse:collapse">${rows}</table>`
    + (notes
      ? `<p style="margin:20px 0 6px;color:#5b6472;font-weight:500">Notes</p>`
        + `<p style="margin:0;white-space:pre-wrap">${escape(notes)}</p>`
      : "")
    + `</div>`;
}
