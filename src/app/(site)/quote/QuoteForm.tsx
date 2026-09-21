"use client";

import { useState, useSyncExternalStore, useTransition } from "react";
import { Check, Phone, Send } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { site } from "@/lib/site";
import { copy, type FormCopy } from "./form-copy";
import { sendEnquiry } from "./actions";

function subscribeToLocation(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
}

export function QuoteFormFromUrl({ variant = copy.quotation }: { variant?: FormCopy }) {
  const search = useSyncExternalStore(subscribeToLocation, () => window.location.search, () => "");
  const presetItem = (new URLSearchParams(search).get("item") ?? "").slice(0, 500);
  return <QuoteForm key={presetItem} presetItem={presetItem} variant={variant} />;
}

const field = "mt-2 w-full rounded-[2px] border border-hair bg-white px-3.5 py-3 text-base outline-none transition-colors placeholder:text-steel focus:border-navy";

export function QuoteForm({ presetItem = "", variant = copy.quotation }: { presetItem?: string; variant?: FormCopy }) {
  const [sent, setSent] = useState(false);
  const [problem, setProblem] = useState("");
  const [pending, startTransition] = useTransition();

  /**
   * The enquiry is delivered server-side, so nothing depends on the visitor
   * having a mail app: the form either confirms it was sent or says plainly
   * that it was not, and offers the phone and WhatsApp numbers instead.
   */
  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = Object.fromEntries(
      [...new FormData(event.currentTarget).entries()].map(([key, value]) => [key, String(value)]),
    );
    setProblem("");
    startTransition(async () => {
      const result = await sendEnquiry(fields);
      if (result.ok) setSent(true);
      else setProblem(result.message);
    });
  }

  if (sent) {
    return (
      <div role="status" className="mt-8 rounded-[2px] border border-hair bg-paper p-6 sm:p-8">
        <p className="flex items-center gap-2.5 font-display text-xl font-semibold text-navy">
          <Check size={20} aria-hidden="true" className="text-vital" />
          {variant.kind === "quotation" ? "Your request is with us" : "Your details are with us"}
        </p>
        <p className="mt-3 max-w-[60ch] text-base leading-relaxed text-ink-soft">
          We’ll be in touch using the phone number or email you gave us. If it’s urgent, call {site.phone}.
        </p>
        <div className="action-stack mt-6 items-center">
          <a href={`tel:${site.phoneIntl}`} className="label inline-flex min-h-11 items-center justify-center gap-2.5 rounded-[2px] border border-ink px-6 py-3.5 font-semibold transition-colors duration-300 hover:bg-ink hover:text-paper">
            <Phone size={14} aria-hidden="true" /> Call {site.phone}
          </a>
          <button type="button" onClick={() => setSent(false)} className="label min-h-11 font-semibold text-navy underline underline-offset-4">
            Send another
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 grid gap-5 sm:grid-cols-2">
      <p className="max-w-[65ch] text-base leading-relaxed text-ink-soft sm:col-span-2">Required fields are marked *. We’ll contact you using the phone number or email you provide.</p>
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
            className={field}
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
          className={field}
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
          className={field}
        />
      </label> : null}

      <label className="block sm:col-span-2">
        <span className="text-sm font-medium text-ink">{variant.notesLabel}</span>
        <textarea
          name="notes"
          rows={4}
          maxLength={3000}
          placeholder={variant.notesPlaceholder}
          className={`${field} resize-y`}
        />
      </label>

      <div className="sm:col-span-2">
        {problem ? (
          <div role="alert" className="mb-5 rounded-[2px] border border-scarlet/35 bg-scarlet/5 p-4">
            <p className="text-sm leading-relaxed text-ink">{problem}</p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
              <a href={site.whatsapp} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-navy underline underline-offset-4">
                <WhatsAppIcon size={15} /> Message on WhatsApp
              </a>
              <a href={`tel:${site.phoneIntl}`} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-navy underline underline-offset-4">
                <Phone size={15} aria-hidden="true" /> Call {site.phone}
              </a>
            </div>
          </div>
        ) : null}

        <div className="action-stack items-center">
          <button
            type="submit"
            disabled={pending}
            className="label inline-flex min-h-11 items-center justify-center gap-2.5 rounded-[2px] bg-scarlet px-6 py-3.5 text-center font-semibold text-white transition-colors duration-300 hover:bg-vital active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send size={14} aria-hidden="true" /> {pending ? "Sending…" : variant.submit}
          </button>
          <a
            href={`tel:${site.phoneIntl}`}
            className="label inline-flex min-h-11 items-center justify-center gap-2.5 rounded-[2px] border border-ink px-6 py-3.5 text-center font-semibold transition-colors duration-300 hover:bg-ink hover:text-paper"
          >
            <Phone size={14} aria-hidden="true" /> Call instead
          </a>
        </div>

        <p aria-live="polite" className="mt-4 text-sm text-ink-soft">
          {pending ? "Sending your details…" : `We usually reply within one working day. You can also call ${site.phone}.`}
        </p>
      </div>
    </form>
  );
}
