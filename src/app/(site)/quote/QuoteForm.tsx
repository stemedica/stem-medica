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
  autoComplete?: string;
};

const FIELDS: Field[] = [
  { name: "facility", label: "Hospital or organization", placeholder: "Name of hospital, clinic or laboratory", required: true, autoComplete: "organization" },
  { name: "contact", label: "Your name", placeholder: "Full name", required: true, autoComplete: "name" },
  { name: "phone", label: "Phone number", placeholder: "09… or +251…", required: true, type: "tel", autoComplete: "tel" },
  { name: "email", label: "Email (optional)", placeholder: "name@example.com", type: "email", autoComplete: "email" },
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
    <form onSubmit={onSubmit} onChange={() => setSent(false)} className="mt-8 grid gap-5 sm:grid-cols-2">
      <p className="max-w-[65ch] text-base leading-relaxed text-ink-soft sm:col-span-2">Required fields are marked *. Your email app will open with these details filled in, ready for you to review and send.</p>
      {FIELDS.map((f) => (
        <label key={f.name} className="block">
          <span className="text-sm font-medium text-ink">
            {f.label}
            {f.required ? <span className="text-scarlet"> *</span> : null}
          </span>
          <input
            name={f.name}
            type={f.type ?? "text"}
            autoComplete={f.autoComplete}
            required={f.required ?? false}
            maxLength={200}
            pattern={f.required ? ".*\\S.*" : undefined}
            onInvalid={(event) => event.currentTarget.setCustomValidity(f.type === "email" ? "Enter a valid email address, or leave this optional field empty." : `Please enter ${f.label.toLowerCase()}.`)}
            onInput={(event) => event.currentTarget.setCustomValidity("")}
            placeholder={f.placeholder}
            className="mt-2 w-full rounded-[2px] border border-hair bg-white px-3.5 py-3 text-base outline-none transition-colors placeholder:text-steel focus:border-navy"
          />
        </label>
      ))}

      <label className="block sm:col-span-2">
        <span className="text-sm font-medium text-ink">
          Equipment needed<span className="text-scarlet"> *</span>
        </span>
        <input
          name="equipment"
          onInvalid={(event) => event.currentTarget.setCustomValidity("Tell us which equipment you need.")}
          onInput={(event) => event.currentTarget.setCustomValidity("")}
          required
          pattern=".*\S.*"
          maxLength={500}
          defaultValue={presetItem}
          placeholder="e.g. neonatal CPAP, patient monitor, mobile X-ray"
          className="mt-2 w-full rounded-[2px] border border-hair bg-white px-3.5 py-3 text-base outline-none transition-colors placeholder:text-steel focus:border-navy"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-ink">Quantity (optional)</span>
        <input
          name="quantity"
          onInvalid={(event) => event.currentTarget.setCustomValidity("Enter a whole number of 1 or more, or leave quantity empty.")}
          onInput={(event) => event.currentTarget.setCustomValidity("")}
          type="number"
          min={1}
          step={1}
          inputMode="numeric"
          placeholder="e.g. 2"
          className="mt-2 w-full rounded-[2px] border border-hair bg-white px-3.5 py-3 text-base outline-none transition-colors placeholder:text-steel focus:border-navy"
        />
      </label>

      <label className="block sm:col-span-2">
        <span className="text-sm font-medium text-ink">Anything else? (optional)</span>
        <textarea
          name="notes"
          rows={4}
          maxLength={3000}
          placeholder="Department, delivery deadline, site details or questions"
          className="mt-2 w-full resize-y rounded-[2px] border border-hair bg-white px-3.5 py-3 text-base outline-none transition-colors placeholder:text-steel focus:border-navy"
        />
      </label>

      <div className="sm:col-span-2">
        <div className="action-stack items-center">
          <button
            type="submit"
            className="label inline-flex min-h-11 items-center justify-center gap-2.5 rounded-[2px] bg-scarlet px-6 py-3.5 text-center font-semibold text-white transition-colors duration-300 hover:bg-vital active:translate-y-px"
          >
            <Send size={14} aria-hidden="true" /> Open request in email
          </button>
          <a
            href={`tel:${site.phoneIntl}`}
            className="label inline-flex min-h-11 items-center justify-center gap-2.5 rounded-[2px] border border-ink px-6 py-3.5 text-center font-semibold transition-colors duration-300 hover:bg-ink hover:text-paper"
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
