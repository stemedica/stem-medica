"use client";

import { useCallback, useRef, useState, useSyncExternalStore } from "react";
import { Mail, Phone } from "lucide-react";
import { site } from "@/lib/site";
import { copy, type FormCopy } from "./form-copy";
import { composeMailto } from "./compose-enquiry";
import { EnquiryFallbackModal } from "./EnquiryFallbackModal";

function subscribeToLocation(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
}

export function QuoteFormFromUrl({ variant = copy.quotation }: { variant?: FormCopy }) {
  const search = useSyncExternalStore(subscribeToLocation, () => window.location.search, () => "");
  const presetItem = (new URLSearchParams(search).get("item") ?? "").slice(0, 500);
  return <QuoteForm key={presetItem} presetItem={presetItem} variant={variant} />;
}

export function QuoteForm({ presetItem = "", variant = copy.quotation }: { presetItem?: string; variant?: FormCopy }) {
  const [draft, setDraft] = useState<{ subject: string; body: string } | null>(null);
  const [status, setStatus] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const closeModal = useCallback(() => setDraft(null), []);

  /**
   * Hand the filled form to the visitor's own mail app.
   *
   * There is no event for "the mail client opened", so this infers it: if the
   * page loses focus or is hidden, something took over and we leave the visitor
   * alone. If it is still focused and visible shortly after, the click almost
   * certainly did nothing, which is what happens on a phone with no mail
   * account, and the fallback offers WhatsApp or a call instead.
   */
  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = Object.fromEntries(
      [...new FormData(event.currentTarget).entries()].map(([key, value]) => [key, String(value)]),
    );
    const composed = composeMailto(site.email, fields, variant);

    let handedOver = false;
    const tookOver = () => { handedOver = true; };
    window.addEventListener("blur", tookOver, { once: true });
    window.addEventListener("pagehide", tookOver, { once: true });
    document.addEventListener("visibilitychange", tookOver, { once: true });

    setStatus("Opening your email app…");
    window.location.href = composed.href;

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      window.removeEventListener("blur", tookOver);
      window.removeEventListener("pagehide", tookOver);
      document.removeEventListener("visibilitychange", tookOver);
      if (handedOver || document.hidden || !document.hasFocus()) {
        setStatus("Your email app should be open with the details filled in. Press send there to finish.");
        return;
      }
      setStatus("");
      setDraft({ subject: composed.subject, body: composed.body });
    }, 1800);
  }

  return (
    <>
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
            className="label inline-flex min-h-11 items-center justify-center gap-2.5 rounded-[2px] bg-scarlet px-6 py-3.5 text-center font-semibold text-white transition-colors duration-300 hover:bg-vital active:translate-y-px"
          >
            <Mail size={14} aria-hidden="true" /> {variant.submit}
          </button>
          <a
            href={`tel:${site.phoneIntl}`}
            className="label inline-flex min-h-11 items-center justify-center gap-2.5 rounded-[2px] border border-ink px-6 py-3.5 text-center font-semibold transition-colors duration-300 hover:bg-ink hover:text-paper"
          >
            <Phone size={14} aria-hidden="true" /> Call instead
          </a>
        </div>

        <p aria-live="polite" className="mt-4 text-sm text-ink-soft">
          {status || `This opens an email on your device, already filled in. You can also call ${site.phone}.`}
        </p>
      </div>
    </form>
    <EnquiryFallbackModal draft={draft} onClose={closeModal} />
    </>
  );
}
