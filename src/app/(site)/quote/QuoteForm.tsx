"use client";

import { useEffect, useRef, useState, useSyncExternalStore, useTransition } from "react";
import { Check, ChevronDown, Phone, Send } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { site } from "@/lib/site";
import { copy, type FormCopy } from "./form-copy";
import { sendEnquiry } from "./actions";

export type EquipmentOption = {
  name: string;
  brand?: string;
  slug?: string;
};

function subscribeToLocation(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
}

export function QuoteFormFromUrl({
  variant = copy.quotation,
  equipment = [],
}: {
  variant?: FormCopy;
  equipment?: EquipmentOption[];
}) {
  const search = useSyncExternalStore(subscribeToLocation, () => window.location.search, () => "");
  const params = new URLSearchParams(search);
  const presetItem = (params.get("equipment") || params.get("item") || "").slice(0, 500);
  return <QuoteForm key={presetItem} presetItem={presetItem} variant={variant} equipment={equipment} />;
}

const field = "mt-2 w-full rounded-[2px] border border-hair bg-white px-3.5 py-3 text-base outline-none transition-colors placeholder:text-steel focus:border-navy";

export function QuoteForm({
  presetItem = "",
  variant = copy.quotation,
  equipment = [],
}: {
  presetItem?: string;
  variant?: FormCopy;
  equipment?: EquipmentOption[];
}) {
  const [sent, setSent] = useState(false);
  const [problem, setProblem] = useState("");
  const [pending, startTransition] = useTransition();
  const [equipmentValue, setEquipmentValue] = useState(presetItem);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const comboboxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (comboboxRef.current && !comboboxRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredEquipment = equipment.filter((item) => {
    if (!equipmentValue.trim()) return true;
    const query = equipmentValue.toLowerCase();
    return item.name.toLowerCase().includes(query) || (item.brand && item.brand.toLowerCase().includes(query));
  });

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
      <div role="status" className="state-enter mt-8 rounded-[2px] border border-hair bg-paper p-6 sm:p-8">
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
          <button type="button" onClick={() => { setSent(false); setEquipmentValue(""); }} className="label min-h-11 font-semibold text-navy underline underline-offset-4">
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

      <div ref={comboboxRef} className="relative block sm:col-span-2">
        <label htmlFor="equipment-input" className="block text-sm font-medium text-ink">
          {variant.mainLabel}<span className="text-scarlet"> *</span>
        </label>

        <div className="relative mt-2">
          <input
            id="equipment-input"
            name="equipment"
            value={equipmentValue}
            onChange={(event) => {
              setEquipmentValue(event.target.value);
              if (!dropdownOpen && equipment.length > 0 && variant.kind === "quotation") {
                setDropdownOpen(true);
              }
            }}
            onFocus={() => {
              if (equipment.length > 0 && variant.kind === "quotation") {
                setDropdownOpen(true);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") setDropdownOpen(false);
            }}
            onInvalid={(event) => event.currentTarget.setCustomValidity(variant.mainInvalid)}
            onInput={(event) => event.currentTarget.setCustomValidity("")}
            required
            pattern=".*\S.*"
            maxLength={500}
            placeholder={
              variant.kind === "quotation"
                ? "Select from catalogue or type equipment needed..."
                : variant.mainPlaceholder
            }
            className={`w-full rounded-[2px] border border-hair bg-white px-3.5 py-3 text-base outline-none transition-colors placeholder:text-steel focus:border-navy ${
              equipment.length > 0 && variant.kind === "quotation" ? "pr-10" : ""
            }`}
          />

          {equipment.length > 0 && variant.kind === "quotation" ? (
            <button
              type="button"
              tabIndex={-1}
              aria-label={dropdownOpen ? "Close catalogue menu" : "Open catalogue menu"}
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="absolute right-0 top-0 flex h-full w-10 items-center justify-center text-steel hover:text-navy transition-colors"
            >
              <ChevronDown
                size={18}
                className={`transition-transform duration-200 ${dropdownOpen ? "rotate-180 text-navy" : ""}`}
                aria-hidden="true"
              />
            </button>
          ) : null}

          {dropdownOpen && equipment.length > 0 && variant.kind === "quotation" ? (
            <ul
              role="listbox"
              className="absolute left-0 right-0 top-full z-30 mt-1 max-h-60 overflow-y-auto rounded-[2px] border border-hair bg-white py-1 shadow-lift outline-none"
            >
              <li className="px-3 py-1.5 text-[11px] font-mono font-medium uppercase tracking-wider text-steel border-b border-hair/60 bg-paper/50">
                Catalogue items ({filteredEquipment.length})
              </li>
              {filteredEquipment.length > 0 ? (
                filteredEquipment.map((item) => {
                  const isSelected = item.name.toLowerCase() === equipmentValue.trim().toLowerCase();
                  return (
                    <li
                      key={item.slug || item.name}
                      role="option"
                      aria-selected={isSelected}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setEquipmentValue(item.name);
                        setDropdownOpen(false);
                      }}
                      className={`flex cursor-pointer items-center justify-between px-3.5 py-2.5 text-sm transition-colors ${
                        isSelected
                          ? "bg-navy-tint font-medium text-navy"
                          : "text-ink hover:bg-paper"
                      }`}
                    >
                      <span className="truncate">{item.name}</span>
                      {item.brand ? (
                        <span className="ml-2 shrink-0 rounded-[2px] border border-hair/80 bg-paper px-2 py-0.5 text-xs text-steel">
                          {item.brand}
                        </span>
                      ) : null}
                    </li>
                  );
                })
              ) : (
                <li className="px-3.5 py-2.5 text-sm text-steel">
                  No exact catalogue match. Your text will be submitted as a custom request.
                </li>
              )}
            </ul>
          ) : null}
        </div>
      </div>

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
          <div role="alert" className="state-enter mb-5 rounded-[2px] border border-scarlet/35 bg-scarlet/5 p-4">
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
            className={`label relative inline-flex min-h-11 items-center justify-center gap-2.5 overflow-hidden rounded-[2px] bg-scarlet px-6 py-3.5 text-center font-semibold text-white transition-colors duration-300 hover:bg-vital active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60 ${pending ? "pending-strip" : ""}`}
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
