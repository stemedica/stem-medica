"use client";

import { useState } from "react";
import { Send, Phone } from "lucide-react";
import { site } from "@/lib/site";

/**
 * Composes a mailto: so the form works today with no backend.
 *
 * When the Telegram enquiry route lands (docs/ARCHITECTURE.md §1) this submits
 * to it instead: store the enquiry, then notify the sales group. Keep the field
 * names, they are the message shape.
 */
type Field = {
  name: string;
  label: string;
  placeholder: string;
  required?: boolean;
  type?: string;
};

const FIELDS: Field[] = [
  { name: "facility", label: "Facility", placeholder: "Hospital or laboratory name", required: true },
  { name: "contact", label: "Your name", placeholder: "Who should we reply to?", required: true },
  { name: "phone", label: "Phone", placeholder: "09.. or +251..", required: true, type: "tel" },
  { name: "email", label: "Email", placeholder: "Optional", type: "email" },
];

export function QuoteForm({ presetItem = "" }: { presetItem?: string }) {
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) ?? "").trim();

    const body = [
      `Facility:  ${get("facility")}`,
      `Contact:   ${get("contact")}`,
      `Phone:     ${get("phone")}`,
      `Email:     ${get("email") || "-"}`,
      "",
      `Equipment: ${get("equipment")}`,
      `Quantity:  ${get("quantity") || "-"}`,
      "",
      "Notes:",
      get("notes") || "-",
    ].join("\n");

    window.location.href =
      `mailto:${site.email}` +
      `?subject=${encodeURIComponent(`Quotation request: ${get("equipment") || "equipment"}`)}` +
      `&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  return (
    <form onSubmit={onSubmit} className="mt-10 grid gap-5 sm:grid-cols-2">
      {FIELDS.map((f) => (
        <label key={f.name} className="block">
          <span className="label text-steel">
            {f.label}
            {f.required ? <span className="text-scarlet"> *</span> : null}
          </span>
          <input
            name={f.name}
            type={f.type ?? "text"}
            required={f.required ?? false}
            placeholder={f.placeholder}
            className="mt-2 w-full rounded-[2px] border border-hair bg-white px-3.5 py-3 text-[15px] outline-none transition-colors placeholder:text-steel/60 focus:border-navy"
          />
        </label>
      ))}

      <label className="block sm:col-span-2">
        <span className="label text-steel">
          Equipment needed<span className="text-scarlet"> *</span>
        </span>
        <input
          name="equipment"
          required
          defaultValue={presetItem}
          placeholder="e.g. neonatal CPAP, patient monitor, mobile X-ray"
          className="mt-2 w-full rounded-[2px] border border-hair bg-white px-3.5 py-3 text-[15px] outline-none transition-colors placeholder:text-steel/60 focus:border-navy"
        />
      </label>

      <label className="block">
        <span className="label text-steel">Quantity</span>
        <input
          name="quantity"
          inputMode="numeric"
          placeholder="e.g. 2"
          className="mt-2 w-full rounded-[2px] border border-hair bg-white px-3.5 py-3 text-[15px] outline-none transition-colors placeholder:text-steel/60 focus:border-navy"
        />
      </label>

      <label className="block sm:col-span-2">
        <span className="label text-steel">Notes</span>
        <textarea
          name="notes"
          rows={4}
          placeholder="Department, case load, installation site, deadline"
          className="mt-2 w-full resize-y rounded-[2px] border border-hair bg-white px-3.5 py-3 text-[15px] outline-none transition-colors placeholder:text-steel/60 focus:border-navy"
        />
      </label>

      <div className="sm:col-span-2">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="label inline-flex items-center gap-2.5 rounded-[2px] bg-scarlet px-6 py-3.5 font-semibold text-white transition-colors duration-300 hover:bg-vital active:translate-y-px"
          >
            <Send size={14} aria-hidden="true" /> Send request
          </button>
          <a
            href={`tel:${site.phoneIntl}`}
            className="label inline-flex items-center gap-2.5 rounded-[2px] border border-ink px-6 py-3.5 font-semibold transition-colors duration-300 hover:bg-ink hover:text-paper"
          >
            <Phone size={14} aria-hidden="true" /> Call instead
          </a>
        </div>

        <p aria-live="polite" className="mt-4 text-sm text-ink-soft">
          {sent
            ? "Your email app should have opened with the request ready to send. If it didn't, call " +
              site.phone + " and we'll take the details over the phone."
            : "This opens your email app with the request filled in. Nothing is stored on this site."}
        </p>
      </div>
    </form>
  );
}
