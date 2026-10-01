"use client";

import { useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { fieldProblemProps, FieldProblem } from "@/components/FormProblems";
import type { FormProblem } from "@/lib/form-errors";

/**
 * Shared admin controls.
 *
 * Both editors previously assembled raw inputs with one `input` class string,
 * so the same field looked slightly different depending on which file it lived
 * in. One vocabulary here keeps the two screens consistent, which matters more
 * in an editor than anything expressive.
 */

export const control =
  "w-full min-w-0 rounded-lg border border-hair bg-white px-3 py-2.5 text-[15px] text-ink " +
  "transition-colors placeholder:text-steel/70 " +
  "hover:border-steel/60 focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/15 " +
  "aria-[invalid=true]:border-vital aria-[invalid=true]:ring-vital/15 " +
  "disabled:cursor-not-allowed disabled:bg-paper disabled:text-steel";

function Label({ label, required, hint }: { label: string; required?: boolean; hint?: string }) {
  return (
    <span className="mb-1.5 flex flex-wrap items-baseline gap-x-2">
      <span className="text-sm font-medium text-ink">{label}</span>
      {required ? <span className="text-xs font-medium text-vital">Required</span> : null}
      {hint ? <span className="text-xs text-steel">{hint}</span> : null}
    </span>
  );
}

type Common = { label: string; required?: boolean; hint?: string; path?: string; problems?: FormProblem[]; className?: string };

export function TextField({
  value, onChange, type = "text", maxLength, placeholder, disabled,
  label, required, hint, path = "", problems = [], className = "",
}: Common & {
  value: string; onChange: (value: string) => void;
  type?: string; maxLength?: number; placeholder?: string; disabled?: boolean;
}) {
  return (
    <label className={`block ${className}`}>
      <Label label={label} required={required} hint={hint} />
      <input
        aria-label={label}
        aria-required={required || undefined}
        {...fieldProblemProps(problems, path)}
        className={control}
        type={type}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      />
      <FieldProblem problems={problems} path={path} />
    </label>
  );
}

export function TextareaField({
  value, onChange, rows = 4, maxLength, placeholder, note,
  label, required, hint, path = "", problems = [], className = "",
}: Common & {
  value: string; onChange: (value: string) => void;
  rows?: number; maxLength?: number; placeholder?: string; note?: ReactNode;
}) {
  return (
    <label className={`block ${className}`}>
      <Label label={label} required={required} hint={hint} />
      <textarea
        aria-label={label}
        aria-required={required || undefined}
        {...fieldProblemProps(problems, path)}
        className={`${control} resize-y leading-relaxed`}
        rows={rows}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
      {note ? <span className="mt-1.5 block text-xs leading-relaxed text-steel">{note}</span> : null}
      <FieldProblem problems={problems} path={path} />
    </label>
  );
}

export function SelectField({
  value, onChange, children,
  label, required, hint, path = "", problems = [], className = "",
}: Common & { value: string; onChange: (value: string) => void; children: ReactNode }) {
  return (
    <label className={`block ${className}`}>
      <Label label={label} required={required} hint={hint} />
      <div className="relative">
        <select
          aria-label={label}
          {...fieldProblemProps(problems, path)}
          className={`${control} appearance-none pr-10`}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {children}
        </select>
        {/* The native arrow differs per platform; this keeps the control consistent. */}
        <svg aria-hidden="true" viewBox="0 0 20 20" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel">
          <path d="M6 8l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <FieldProblem problems={problems} path={path} />
    </label>
  );
}

export function CheckboxField({
  checked, onChange, label, hint,
}: { checked: boolean; onChange: (checked: boolean) => void; label: string; hint?: string }) {
  return (
    <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-hair bg-white px-3 py-2.5 transition-colors hover:border-steel/60 has-[:focus-visible]:border-navy has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-navy/15">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-navy)]"
      />
      <span className="min-w-0">
        <span className="block text-sm font-medium text-ink">{label}</span>
        {hint ? <span className="mt-0.5 block text-xs leading-relaxed text-steel">{hint}</span> : null}
      </span>
    </label>
  );
}

/** Native file inputs look different in every browser; this wraps one in a button. */
export function FileField({
  label, hint, accept, multiple, disabled, loading, loadingMessage, onFiles, inputKey,
}: {
  label: string; hint?: string; accept: string; multiple?: boolean; disabled?: boolean;
  loading?: boolean; loadingMessage?: string;
  onFiles: (files: File[]) => void | Promise<void>; inputKey?: string;
}) {
  const [internalLoading, setInternalLoading] = useState(false);
  const isBusy = Boolean(loading || internalLoading);
  const isDisabled = Boolean(disabled || isBusy);

  return (
    <div>
      <Label label={label} hint={hint} />
      <label
        aria-busy={isBusy}
        className={`relative flex min-h-11 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg border border-dashed px-4 py-3 text-sm font-medium text-navy transition-colors has-[:focus-visible]:border-navy has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-navy/15 ${
          isBusy
            ? "border-navy/50 bg-navy-tint/50 pending-strip pointer-events-none cursor-wait"
            : isDisabled
            ? "border-hair bg-paper pointer-events-none opacity-50"
            : "border-hair bg-paper hover:border-navy hover:bg-navy-tint/40"
        }`}
      >
        <input
          key={inputKey}
          aria-label={label}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={isDisabled}
          className="sr-only"
          onChange={async (event) => {
            const files = Array.from(event.target.files ?? []);
            event.target.value = "";
            if (!files.length) return;
            try {
              setInternalLoading(true);
              await onFiles(files);
            } finally {
              setInternalLoading(false);
            }
          }}
        />
        {isBusy ? (
          <span className="flex items-center gap-2 text-navy" role="status" aria-live="polite">
            <Loader2 className="size-4 animate-spin text-navy" aria-hidden="true" />
            <span>{loadingMessage || (multiple ? "Uploading images…" : "Uploading image…")}</span>
          </span>
        ) : (
          `Choose ${multiple ? "images" : "an image"}`
        )}
      </label>
    </div>
  );
}

/** A titled group of fields. Replaces the disclosure that hid most of each form. */
export function Panel({
  title, description, actions, children, tone = "default",
}: {
  title: string; description?: ReactNode; actions?: ReactNode; children: ReactNode;
  tone?: "default" | "accent";
}) {
  return (
    <section className={`rounded-xl border bg-white ${tone === "accent" ? "border-navy/25" : "border-hair"}`}>
      <header className={`flex flex-wrap items-start justify-between gap-3 border-b px-4 py-3 sm:px-5 ${tone === "accent" ? "border-navy/15 bg-navy-tint/40" : "border-hair"}`}>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-navy">{title}</h3>
          {description ? <p className="mt-1 max-w-[62ch] text-xs leading-relaxed text-ink-soft">{description}</p> : null}
        </div>
        {actions}
      </header>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

export function StatusPill({ published }: { published: boolean }) {
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${published ? "bg-navy-tint text-navy" : "bg-paper-2 text-steel"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${published ? "bg-navy" : "bg-steel"}`} />
      {published ? "Published" : "Draft"}
    </span>
  );
}

export function EmptyState({ title, message, action }: { title: string; message: string; action?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-hair bg-white px-6 py-12 text-center">
      <h3 className="text-base font-semibold text-navy">{title}</h3>
      <p className="mx-auto mt-2 max-w-[46ch] text-sm leading-relaxed text-ink-soft">{message}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
