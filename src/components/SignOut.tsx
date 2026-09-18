"use client";
/* eslint-disable @next/next/no-location-assign-relative-destination -- Full navigation clears cached admin UI after session revocation. */
import { useState } from "react";
import { authClient } from "@/lib/auth/client";
import { confirmSignOut } from "./ConfirmationModal";
export function SignOut() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return <span><button type="button" className="min-h-11 px-2 underline underline-offset-4 disabled:opacity-60" disabled={busy} onClick={async () => {
    setBusy(true); setError("");
    try {
      if (!await confirmSignOut()) { setBusy(false); return; }
      const result = await authClient.signOut(); if (result.error) throw new Error();
      window.dispatchEvent(new Event("admin:signed-out")); window.location.assign("/auth/login");
    }
    catch { setError("Sign-out failed. Please retry."); setBusy(false); }
  }}>{busy ? "Signing out…" : "Sign out"}</button>{error ? <span role="alert" className="ml-2 text-sm">{error}</span> : null}</span>;
}
