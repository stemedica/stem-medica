"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Phone, Copy, Check, X } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { site } from "@/lib/site";

/**
 * Shown when the visitor's device appears to have no email app.
 *
 * A mailto link on a phone with no mail account configured does nothing at all:
 * no error, no feedback, and the enquiry is lost without either side knowing.
 * Plenty of people here use WhatsApp and Telegram but never set up email, so
 * this offers the channels they do have.
 *
 * The wording assumes nothing, because the detection cannot be certain. If the
 * mail app did open behind this, "Didn't open?" still reads correctly.
 */
export function EnquiryFallbackModal({
  draft,
  onClose,
}: {
  draft: { subject: string; body: string } | null;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const firstRef = useRef<HTMLAnchorElement>(null);
  const id = useId();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || !draft) return;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    firstRef.current?.focus();
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      if (previous instanceof HTMLElement && previous.isConnected) previous.focus();
    };
  }, [draft]);

  async function copy() {
    if (!draft) return;
    try {
      await navigator.clipboard.writeText(`${draft.subject}\n\n${draft.body}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }

  const whatsapp = draft
    ? `${site.whatsapp}?text=${encodeURIComponent(`${draft.subject}\n\n${draft.body}`)}`
    : site.whatsapp;

  return (
    <dialog
      ref={ref}
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-message`}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const focusable = event.currentTarget.querySelectorAll<HTMLElement>("a[href], button:not(:disabled)");
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }}
      className="fixed inset-0 m-auto max-h-[85svh] w-[calc(100%_-_2rem)] max-w-md overflow-y-auto rounded-2xl border border-hair bg-white p-6 text-ink shadow-xl backdrop:bg-slate-950/50 sm:p-8"
    >
      <div className="flex items-start justify-between gap-4">
        <h2 id={`${id}-title`} className="font-display text-xl font-semibold text-navy">
          Didn’t your email open?
        </h2>
        <button type="button" onClick={onClose} aria-label="Close" className="-mr-2 -mt-1 flex h-11 w-11 items-center justify-center rounded-full text-steel hover:bg-paper hover:text-ink">
          <X size={18} aria-hidden="true" />
        </button>
      </div>

      <p id={`${id}-message`} className="mt-3 text-[15px] leading-relaxed text-ink-soft">
        Some phones have no email app set up. Send us the same details whichever
        way suits you, and we will take it from there.
      </p>

      <div className="mt-6 grid gap-2.5">
        <a
          ref={firstRef}
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full bg-[#25D366] px-6 font-medium text-white transition-opacity hover:opacity-90"
        >
          <WhatsAppIcon size={18} /> Send on WhatsApp
        </a>
        <a
          href={`tel:${site.phoneIntl}`}
          className="inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full border border-ink px-6 font-medium transition-colors hover:bg-ink hover:text-paper"
        >
          <Phone size={16} aria-hidden="true" /> Call {site.phone}
        </a>
        <button
          type="button"
          onClick={() => void copy()}
          className="inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full border border-hair px-6 font-medium text-ink-soft transition-colors hover:border-navy hover:text-navy"
        >
          {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
          {copied ? "Copied" : "Copy the details"}
        </button>
      </div>

      <p aria-live="polite" className="sr-only">{copied ? "Details copied" : ""}</p>

      <details className="mt-5">
        <summary className="cursor-pointer text-sm font-medium text-navy">Show the message</summary>
        <pre className="mt-3 max-h-56 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-paper p-4 text-xs leading-relaxed text-ink">
          {draft?.body}
        </pre>
      </details>
    </dialog>
  );
}
