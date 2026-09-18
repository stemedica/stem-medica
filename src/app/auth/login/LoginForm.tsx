"use client";
/* eslint-disable @next/next/no-location-assign-relative-destination -- Full navigation clears the old authenticated router state. */
import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { authClient } from "@/lib/auth/client";
import { UserFacingError, userError } from "@/lib/form-errors";
const input = "mt-2 block w-full min-w-0 rounded-lg border border-hair px-3 py-3 focus-visible:outline-2 focus-visible:outline-navy";
export function LoginForm() {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  return <>
    <h1 className="font-display text-3xl font-semibold">Admin sign-in</h1>
    <p className="mt-3 text-sm leading-relaxed text-ink-soft">Sign in with your email and password to manage your website.</p>
    <form className="mt-6" onSubmit={async (event) => {
      event.preventDefault(); setBusy(true); setError("");
      try {
        const result = await authClient.signIn.email({ email: email.trim(), password });
        if (result.error) throw new UserFacingError(result.error.status === 429 ? "Too many attempts. Please wait before trying again." : result.error.status === 409 ? result.error.message : "Unable to sign in. Check your email and password.");
        setPassword(""); window.location.assign("/admin");
      } catch (failure) { setError(userError(failure, "We couldn’t connect to sign you in. Please try again.")); }
      finally { setBusy(false); }
    }}><fieldset disabled={busy} className="space-y-5 disabled:opacity-70">
      <label className="block text-sm">Email<input className={input} type="email" autoComplete="username" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} /></label>
      <label className="block text-sm">Password<input className={input} type="password" autoComplete="current-password" required maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} /></label>
      <button className="btn-primary w-full" type="submit">{busy ? "Checking…" : "Sign in"}</button>
      <p className="text-xs text-steel">Forgot your password? Ask the site owner to run the private password-reset command.</p>
    </fieldset></form>
    {error ? <div role="alert" className="mt-4 flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 p-3 text-sm leading-relaxed text-red-800"><AlertCircle className="mt-0.5 shrink-0" size={17} aria-hidden="true" /><span>{error}</span></div> : null}
  </>;
}
