"use client";

import { useEffect } from "react";

// Only a position marker is stored in history.state; never form data or secrets.
const key = "stemMedicaHistoryPosition";
const guards = new Set<() => Promise<boolean>>();
export function registerHistoryGuard(guard: () => Promise<boolean>) {
  guards.add(guard);
  return () => { guards.delete(guard); };
}

type Position = { document: string; index: number };
function position(state: unknown): Position | undefined {
  const value = (state as Record<string, unknown> | null)?.[key] as Position | undefined;
  return value && typeof value.document === "string" && Number.isInteger(value.index) ? value : undefined;
}

/** Mounted once in the root layout so positions exist before entering an editor.
 * popstate is not cancelable. Restore the original entry before asking, then
 * replay the exact traversal only after consent. Capture runs before the App
 * Router's popstate listener so the editor is never unmounted while asking.
 * No sentinel/duplicate entries are pushed; Forward history stays intact.
 */
export function HistoryNavigationGuard() {
  useEffect(() => {
    const history = window.history;
    const push = history.pushState;
    const replace = history.replaceState;
    const documentId = position(history.state)?.document ?? crypto.randomUUID();
    let current = position(history.state)?.index ?? 0;
    let currentUrl = location.href;
    let active = true;
    let pending: { from: number; to: number; restored: boolean; asking: boolean } | null = null;
    let approved: number | null = null;

    const stamp = (state: unknown, index: number) => ({ ...(state as object | null), [key]: { document: documentId, index } });
    replace.call(history, stamp(history.state, current), "");
    let currentState = history.state;
    const pushState: History["pushState"] = function (state, unused, url) {
      if (!active) return push.call(history, state, unused, url);
      push.call(history, stamp(state, current + 1), unused, url);
      current++; currentUrl = location.href; currentState = history.state;
    };
    const replaceState: History["replaceState"] = function (state, unused, url) {
      if (!active) return replace.call(history, state, unused, url);
      replace.call(history, stamp(state, current), unused, url);
      currentUrl = location.href; currentState = history.state;
    };
    history.pushState = pushState;
    history.replaceState = replaceState;

    async function ask() {
      const attempt = pending;
      if (!attempt || attempt.asking) return;
      attempt.asking = true;
      let accepted = false;
      try {
        accepted = true;
        for (const guard of guards) {
          if (!await guard()) { accepted = false; break; }
        }
      } catch { accepted = false; }
      if (!active || pending !== attempt) return;
      // A second Back/Forward can arrive while the dialog is open. Wait for
      // restoration before replaying, rather than applying a stale delta.
      attempt.asking = false;
      if (!attempt.restored) return;
      pending = null;
      if (accepted) { approved = attempt.to; history.go(attempt.to - attempt.from); }
    }

    function trackHashEntry() {
      const before = new URL(currentUrl), after = new URL(location.href);
      if (!position(history.state) && before.pathname === after.pathname && before.search === after.search && before.hash !== after.hash) {
        // Native anchor navigation bypasses pushState. Keep its position and
        // the existing router fields so later multi-entry traversals stay exact.
        replace.call(history, stamp(currentState, current + 1), "");
        current++; currentUrl = location.href; currentState = history.state;
      }
    }
    function pop(event: PopStateEvent) {
      const target = position(event.state);
      if (!target) { trackHashEntry(); return; }
      if (target.document !== documentId) return;
      const index = target.index;
      if (approved === index) {
        approved = null; current = index; currentUrl = location.href; currentState = history.state;
        return; // Let Next restore this destination, including its router state.
      }
      if (pending) {
        event.stopImmediatePropagation();
        pending.restored = index === pending.from;
        if (!pending.restored) history.go(pending.from - index);
        else void ask();
        return;
      }
      const fromUrl = new URL(currentUrl);
      const toUrl = new URL(location.href);
      const samePage = fromUrl.pathname === toUrl.pathname && fromUrl.search === toUrl.search;
      if (!guards.size || index === current || samePage) {
        current = index; currentUrl = location.href; currentState = history.state;
        return;
      }
      event.stopImmediatePropagation();
      pending = { from: current, to: index, restored: false, asking: false };
      history.go(current - index);
    }
    window.addEventListener("popstate", pop, true);
    window.addEventListener("hashchange", trackHashEntry);
    return () => {
      active = false;
      window.removeEventListener("popstate", pop, true);
      window.removeEventListener("hashchange", trackHashEntry);
      if (history.pushState === pushState) history.pushState = push;
      if (history.replaceState === replaceState) history.replaceState = replace;
    };
  }, []);
  return null;
}
