"use client";
import { useState } from "react";
import { authClient } from "@/lib/auth/client";
import { UserFacingError, userError } from "@/lib/form-errors";

const input = "mt-2 block w-full min-w-0 rounded-lg border border-hair px-3 py-3 focus-visible:outline-2 focus-visible:outline-navy";
export function FirstLoginForm({ email, token }: { email: string; token: string }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return <>
    <p className="mb-3 font-mono text-xs uppercase tracking-wider text-steel">First-time setup · Local only</p>
    <h1 className="font-display text-3xl font-semibold">Welcome to your admin</h1>
    <p className="mt-3 mb-6 text-sm leading-relaxed text-ink-soft">Choose a password to get started. You can add an authenticator later in Security settings—it’s optional.</p>
    <form onSubmit={async (event) => {
      event.preventDefault(); setError("");
      if (password !== confirm) { setError("The passwords don’t match. Please check both fields."); return; }
      setBusy(true);
      try {
        const response = await fetch("/test/api/local-admin", { method: "POST", headers: { "Content-Type": "application/json", "x-local-setup": token }, body: JSON.stringify({ email, password }) });
        const result = await response.json();
        if (!response.ok) throw new UserFacingError(result.error ?? "Unable to create your account.");
        const login = await authClient.signIn.email({ email, password });
        setPassword(""); setConfirm("");
        window.location.assign(login.error ? "/test/auth/login?created=1" : "/test/admin");
      } catch (failure) { setError(userError(failure, "We couldn’t create your account. Check your connection and try again.")); }
      finally { setBusy(false); }
    }}>
      <fieldset disabled={busy} className="space-y-5 disabled:opacity-70">
        <label className="block text-sm">Admin email<input className={input + " bg-paper"} type="email" value={email} autoComplete="username" readOnly /></label>
        <label className="block text-sm">New password<input className={input} type="password" autoComplete="new-password" minLength={10} maxLength={128} required value={password} onChange={(event) => setPassword(event.target.value)} aria-describedby="password-help" /></label>
        <p id="password-help" className="text-xs text-steel">Use at least 10 characters and a password you don’t use elsewhere.</p>
        <label className="block text-sm">Confirm new password<input className={input} type="password" autoComplete="new-password" minLength={10} maxLength={128} required value={confirm} onChange={(event) => setConfirm(event.target.value)} /></label>
        <button className="btn-primary w-full" type="submit">{busy ? "Creating your account…" : "Create account & continue"}</button>
      </fieldset>
      <p role="alert" className="mt-4 text-sm">{error}</p>
    </form>
  </>;
}
