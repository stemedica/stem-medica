"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { registerHistoryGuard } from "./HistoryNavigationGuard";

type Confirmation = { title: string; message: string; action?: string; cancel?: string };
const signOutGuards = new Set<() => Promise<boolean>>();
export async function confirmSignOut() {
  for (const guard of signOutGuards) if (!await guard()) return false;
  return true;
}
export function useConfirmation() {
  const [pending, setPending] = useState<Confirmation | null>(null);
  const resolver = useRef<((accepted: boolean) => void) | null>(null);
  const confirm = useCallback((options: Confirmation) => {
    if (resolver.current) return Promise.resolve(false);
    return new Promise<boolean>((resolve) => { resolver.current = resolve; setPending(options); });
  }, []);
  const finish = useCallback((accepted: boolean) => {
    resolver.current?.(accepted); resolver.current = null; setPending(null);
  }, []);
  useEffect(() => () => { resolver.current?.(false); resolver.current = null; }, []);
  return { confirm, confirmationModal: <ConfirmationModal pending={pending} finish={finish} /> };
}

function ConfirmationModal({ pending, finish }: { pending: Confirmation | null; finish: (accepted: boolean) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || !pending) return;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    return () => {
      dialog.close(); document.body.style.overflow = overflow;
      if (previous instanceof HTMLElement && previous.isConnected) previous.focus();
    };
  }, [pending]);
  return <dialog ref={ref} aria-labelledby={`${id}-title`} aria-describedby={`${id}-message`}
    className="no-print fixed inset-0 m-auto max-h-[85svh] w-[calc(100%_-_2rem)] max-w-md overflow-y-auto rounded-2xl border border-hair bg-white p-6 text-ink shadow-xl backdrop:bg-slate-950/50 sm:p-8"
    onKeyDown={(event) => {
      if (event.key !== "Tab") return;
      const buttons = event.currentTarget.querySelectorAll<HTMLButtonElement>("button:not(:disabled)");
      const first = buttons[0], last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }}
    onCancel={(event) => { event.preventDefault(); finish(false); }}
    onClick={(event) => { if (event.target === event.currentTarget) finish(false); }}>
    <div>
      <h2 id={`${id}-title`} className="font-display text-2xl font-semibold">{pending?.title}</h2>
      <p id={`${id}-message`} className="mt-3 break-words text-sm leading-relaxed text-ink-soft">{pending?.message}</p>
      <div className="action-stack mt-6 justify-end">
        <button type="button" className="btn-outline" autoFocus onClick={() => finish(false)}>{pending?.cancel ?? "Cancel"}</button>
        <button type="button" className="btn-primary" onClick={() => finish(true)}>{pending?.action ?? "Continue"}</button>
      </div>
    </div>
  </dialog>;
}

// In-app links use our modal. Reload/tab-close warnings are browser-controlled:
// browsers cannot wait for a custom asynchronous modal during beforeunload.
export function useUnsavedChanges(dirty: boolean, confirm: ReturnType<typeof useConfirmation>["confirm"]) {
  useEffect(() => {
    let leaving = false;
    const unregisterHistory = dirty ? registerHistoryGuard(() => confirm({ title: "Leave without saving?", message: "Your unsaved changes will be lost. Cancel to return and save them.", action: "Leave page" })) : () => {};
    const signOut = async () => !dirty || await confirm({ title: "Sign out without saving?", message: "Your unsaved edits will be lost. Keep editing to save them first.", action: "Sign out without saving", cancel: "Keep editing" });
    const signedOut = () => { leaving = true; };
    signOutGuards.add(signOut);
    window.addEventListener("admin:signed-out", signedOut);
    const warn = (event: BeforeUnloadEvent) => { if (dirty && !leaving) event.preventDefault(); };
    const leave = (event: MouseEvent) => {
      if (!dirty || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
      const url = new URL(link.href);
      if (!["http:", "https:"].includes(url.protocol) || url.href === window.location.href || (url.pathname === window.location.pathname && url.search === window.location.search && url.hash)) return;
      event.preventDefault(); event.stopImmediatePropagation();
      void confirm({ title: "Leave without saving?", message: "Your unsaved changes will be lost. Cancel to return and save them.", action: "Leave page" }).then((accepted) => {
        if (accepted) { leaving = true; window.location.assign(url.href); }
      });
    };
    window.addEventListener("beforeunload", warn); document.addEventListener("click", leave, true);
    return () => { unregisterHistory(); signOutGuards.delete(signOut); window.removeEventListener("admin:signed-out", signedOut); window.removeEventListener("beforeunload", warn); document.removeEventListener("click", leave, true); };
  }, [dirty, confirm]);
}
