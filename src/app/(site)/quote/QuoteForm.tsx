"use client";

import { useState, useSyncExternalStore } from "react";
import { Send, Phone } from "lucide-react";
import { site } from "@/lib/site";
import { quoteResultMessage } from "./quote-result";

type Field = {
  name: string;
  label: string;
  placeholder: string;
  required?: boolean;
  type?: string;
  autoComplete?: string;
};

const person: Field[] = [
  { name: "contact", label: "Your name", placeholder: "Full name", required: true, autoComplete: "name" },
  { name: "phone", label: "Phone number", placeholder: "09… or +251…", required: true, type: "tel", autoComplete: "tel" },
  { name: "email", label: "Email (optional)", placeholder: "name@example.com", type: "email", autoComplete: "email" },
];

/**
 * Both intents share the enquiry pipeline and differ only in wording, so one
 * form serves both rather than a near-duplicate copy drifting out of sync.
 * `kind` is submitted with the form and decides where the visitor is returned.
 */
export const copy = {
  quotation: {
    kind: "quotation",
    fields: [
      { name: "facility", label: "Hospital or organization", placeholder: "Name of hospital, clinic or laboratory", required: true, autoComplete: "organization" },
      ...person,
    ] as Field[],
    mainLabel: "Equipment needed",
    mainPlaceholder: "e.g. neonatal CPAP, patient monitor, mobile X-ray",
    mainInvalid: "Tell us which equipment you need.",
    showQuantity: true,
    notesLabel: "Anything else? (optional)",
    notesPlaceholder: "Department, delivery deadline, site details or questions",
    submit: "Send quotation request",
    busy: "Sending request…",
  },
  partnership: {
    kind: "partnership",
    fields: [
      { name: "facility", label: "Company name", placeholder: "Manufacturer or exporter name", required: true, autoComplete: "organization" },
      ...person,
    ] as Field[],
    mainLabel: "Products you manufacture or export",
    mainPlaceholder: "e.g. patient monitors, infusion pumps, laboratory analysers",
    mainInvalid: "Tell us which products you supply.",
    showQuantity: false,
    notesLabel: "Certifications, territory and terms (optional)",
    notesPlaceholder: "CE/ISO certification, countries you already cover, distributor terms, lead times",
    submit: "Send partnership details",
    busy: "Sending details…",
  },
} as const;

export type FormCopy = (typeof copy)[keyof typeof copy];

type FormState = { kind: "idle" | "busy" | "success" | "error"; message: string };

function subscribeToLocation(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
}

export function QuoteFormFromUrl({ variant = copy.quotation }: { variant?: FormCopy }) {
  const search = useSyncExternalStore(subscribeToLocation, () => window.location.search, () => "");
  const searchParams = new URLSearchParams(search);
  const presetItem = (searchParams.get("item") ?? "").slice(0, 500);
  const initialMessage = searchParams.get("sent") === "1"
    ? quoteResultMessage("sent")
    : quoteResultMessage(searchParams.get("error"));
  return <QuoteForm key={`${presetItem}-${initialMessage}`} presetItem={presetItem} initialMessage={initialMessage} variant={variant} />;
}

export function QuoteForm({ presetItem = "", initialMessage = "", variant = copy.quotation }: { presetItem?: string; initialMessage?: string; variant?: FormCopy }) {
  const [state, setState] = useState<FormState>(initialMessage
    ? { kind: initialMessage.startsWith("Thanks") ? "success" : "error", message: initialMessage }
    : { kind: "idle", message: "" });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setState({ kind: "busy", message: "Sending your request…" });
    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json() as { message?: string };
      if (!response.ok) throw new Error(result.message || "We couldn’t save your request. Please call or try again.");
      form.reset();
      setState({ kind: "success", message: "Thanks — your request is saved. Our team will contact you using the details you provided." });
    } catch (error) {
      setState({ kind: "error", message: error instanceof Error ? error.message : "We couldn’t save your request. Please call or try again." });
    }
  }

  return (
    <form action="/api/enquiries" method="post" onSubmit={onSubmit} onChange={() => state.kind !== "busy" && setState({ kind: "idle", message: "" })} className="mt-8 grid gap-5 sm:grid-cols-2">
      <p className="max-w-[65ch] text-base leading-relaxed text-ink-soft sm:col-span-2">Required fields are marked *. We’ll save your request securely and contact you using the phone number or email you provide.</p>
      <label className="absolute -left-[9999px]" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      <input type="hidden" name="kind" value={variant.kind} />
      {variant.fields.map((f) => (
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
          {variant.mainLabel}<span className="text-scarlet"> *</span>
        </span>
        <input
          name="equipment"
          onInvalid={(event) => event.currentTarget.setCustomValidity(variant.mainInvalid)}
          onInput={(event) => event.currentTarget.setCustomValidity("")}
          required
          pattern=".*\S.*"
          maxLength={500}
          defaultValue={presetItem}
          placeholder={variant.mainPlaceholder}
          className="mt-2 w-full rounded-[2px] border border-hair bg-white px-3.5 py-3 text-base outline-none transition-colors placeholder:text-steel focus:border-navy"
        />
      </label>

      {variant.showQuantity ? <label className="block">
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
      </label> : null}

      <label className="block sm:col-span-2">
        <span className="text-sm font-medium text-ink">{variant.notesLabel}</span>
        <textarea
          name="notes"
          rows={4}
          maxLength={3000}
          placeholder={variant.notesPlaceholder}
          className="mt-2 w-full resize-y rounded-[2px] border border-hair bg-white px-3.5 py-3 text-base outline-none transition-colors placeholder:text-steel focus:border-navy"
        />
      </label>

      <div className="sm:col-span-2">
        <div className="action-stack items-center">
          <button
            type="submit"
            disabled={state.kind === "busy"}
            className="label inline-flex min-h-11 items-center justify-center gap-2.5 rounded-[2px] bg-scarlet px-6 py-3.5 text-center font-semibold text-white transition-colors duration-300 hover:bg-vital active:translate-y-px"
          >
            <Send size={14} aria-hidden="true" /> {state.kind === "busy" ? variant.busy : variant.submit}
          </button>
          <a
            href={`tel:${site.phoneIntl}`}
            className="label inline-flex min-h-11 items-center justify-center gap-2.5 rounded-[2px] border border-ink px-6 py-3.5 text-center font-semibold transition-colors duration-300 hover:bg-ink hover:text-paper"
          >
            <Phone size={14} aria-hidden="true" /> Call instead
          </a>
        </div>

        <p aria-live="polite" role={state.kind === "error" ? "alert" : "status"} className={`mt-4 text-sm ${state.kind === "error" ? "font-medium text-vital" : state.kind === "success" ? "font-medium text-navy" : "text-ink-soft"}`}>
          {state.message || `We usually follow up by phone. You can also call ${site.phone} if your request is urgent.`}
        </p>
      </div>
    </form>
  );
}
