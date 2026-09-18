"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { CircleAlert, CircleCheck } from "lucide-react";
import type { FeedbackTone } from "./useAdminFeedback";

export function AdminSaveBar({ label, onSave, disabled, busy, dirty, message, tone = "info", children, cleanLabel = "No unsaved changes" }: {
  label: string; onSave: () => void | Promise<void>; disabled: boolean; busy: boolean;
  dirty: boolean; message: string; tone?: FeedbackTone; children?: ReactNode; cleanLabel?: string;
}) {
  const bar = useRef<HTMLElement>(null);
  const pending = useRef(false);
  const [saving, setSaving] = useState(false);
  async function submit() {
    if (disabled || busy || pending.current) return;
    pending.current = true;
    setSaving(true);
    try { await onSave(); } finally { pending.current = false; setSaving(false); }
  }
  useEffect(() => {
    function keydown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s" && !event.altKey) {
        event.preventDefault();
        if (!event.repeat && !document.querySelector("dialog[open]")) void submit();
      }
    }
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  });
  useEffect(() => {
    const element = bar.current;
    if (!element) return;
    const media = matchMedia("(max-width: 639px)");
    const oldPadding = document.body.style.paddingBottom;
    const oldScroll = document.documentElement.style.scrollPaddingBottom;
    const oldTop = document.documentElement.style.scrollPaddingTop;
    function resize() {
      const height = `${element!.getBoundingClientRect().height + 16}px`;
      document.body.style.paddingBottom = media.matches ? height : oldPadding;
      document.documentElement.style.scrollPaddingBottom = media.matches ? height : oldScroll;
      document.documentElement.style.scrollPaddingTop = media.matches ? oldTop : height;
    }
    const observer = new ResizeObserver(resize);
    observer.observe(element); media.addEventListener("change", resize); resize();
    return () => { observer.disconnect(); media.removeEventListener("change", resize); document.body.style.paddingBottom = oldPadding; document.documentElement.style.scrollPaddingBottom = oldScroll; document.documentElement.style.scrollPaddingTop = oldTop; };
  }, []);
  return <section ref={bar} aria-label="Save actions" className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-hair bg-white px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-sm sm:sticky sm:top-0 sm:col-span-full sm:my-5 sm:rounded-xl sm:border sm:p-4">
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs"><span className="font-medium text-navy">{saving ? "Saving…" : busy ? "Please wait…" : dirty ? "Unsaved changes" : cleanLabel}</span><span className="hidden text-steel sm:inline">Ctrl / ⌘ + S to save</span></div>
    <div className="action-stack mt-2 gap-2"><button type="button" aria-label={label} aria-busy={saving} disabled={disabled || busy || saving} onClick={() => void submit()} className="min-h-11 flex-1 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none">{saving ? "Saving…" : label}</button>{children}</div>
    <div role={tone === "error" ? "alert" : "status"} aria-atomic="true" className={`mt-2 flex max-h-32 items-start gap-2 overflow-y-auto break-words text-sm leading-relaxed ${tone === "error" ? "rounded-lg border border-vital/30 bg-red-50 p-3 text-vital" : tone === "warning" ? "rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-950" : "text-ink-soft"}`}>
      {message && !(tone === "success" && dirty) ? <>{tone === "error" || tone === "warning" ? <CircleAlert size={18} className="mt-0.5 shrink-0" aria-hidden="true" /> : tone === "success" ? <CircleCheck size={18} className="mt-0.5 shrink-0 text-navy" aria-hidden="true" /> : null}<span>{message}</span></> : null}
    </div>
  </section>;
}
