"use client";
/* eslint-disable @next/next/no-location-assign-relative-destination -- Full navigation clears the old authenticated router state. */
import { useState } from "react";
import { authClient } from "@/lib/auth/client";
import { UserFacingError, userError } from "@/lib/form-errors";
const input = "mt-2 block w-full min-w-0 rounded-lg border border-hair px-3 py-3 focus-visible:outline-2 focus-visible:outline-navy";
export function LoginForm() {
  const [step, setStep] = useState<"password" | "code" | "recovery">("password");
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  return <>
    <h1 className="font-display text-3xl font-semibold">{step === "password" ? "Admin sign-in" : step === "code" ? "Verify it’s you" : "Use a recovery code"}</h1>
    <p className="mt-3 text-sm leading-relaxed text-ink-soft">{step === "password" ? "Sign in with your email and password to manage your website." : step === "code" ? "Enter the current six-digit code from your authenticator app." : "Enter one of the single-use codes saved during setup. Your password is still required."}</p>
    <form className="mt-6" onSubmit={async (event) => {
      event.preventDefault(); setBusy(true); setError("");
      try {
        if (step === "password") {
          const result = await authClient.signIn.email({ email: email.trim(), password });
          if (result.error) throw new UserFacingError(result.error.status === 429 ? "Too many attempts. Please wait before trying again." : "Unable to sign in. Check your details or try again later.");
          setPassword("");
          if (result.data && "twoFactorRedirect" in result.data && result.data.twoFactorRedirect) setStep("code"); else window.location.assign("/test/admin");
        } else {
          const result = step === "code" ? await authClient.twoFactor.verifyTotp({ code: code.trim(), trustDevice: false }) : await authClient.twoFactor.verifyBackupCode({ code: code.trim(), trustDevice: false });
          if (result.error) throw new UserFacingError(result.error.status === 429 ? "Too many attempts. Please wait before trying again." : "That code wasn’t accepted. Try a new code or restart sign-in.");
          setCode(""); window.location.assign("/test/admin");
        }
      } catch (failure) { setError(userError(failure, "We couldn’t connect to sign you in. Please try again.")); }
      finally { setBusy(false); }
    }}><fieldset disabled={busy} className="space-y-5 disabled:opacity-70">
      {step === "password" ? <><label className="block text-sm">Email<input className={input} type="email" autoComplete="username" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} /></label><label className="block text-sm">Password<input className={input} type="password" autoComplete="current-password" required maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} /></label></> : <label className="block text-sm">{step === "code" ? "Authenticator code" : "Recovery code"}<input className={input} autoComplete="one-time-code" inputMode={step === "code" ? "numeric" : "text"} pattern={step === "code" ? "[0-9]{6}" : undefined} required maxLength={step === "code" ? 6 : 64} value={code} onChange={(event) => setCode(event.target.value)} /></label>}
      <button className="btn-primary w-full" type="submit">{busy ? "Checking…" : step === "password" ? "Sign in" : "Verify and continue"}</button>
      {step !== "password" ? <div className="space-y-3 text-sm"><button className="block underline" type="button" onClick={() => { setStep(step === "code" ? "recovery" : "code"); setCode(""); setError(""); }}>{step === "code" ? "Use a recovery code" : "Use authenticator instead"}</button><button className="block underline" type="button" onClick={() => { setStep("password"); setCode(""); setError(""); }}>Restart sign-in</button></div> : <p className="text-xs text-steel">Forgot your password? Contact the site owner for a verified reset. Public registration is disabled.</p>}
    </fieldset></form>
    <p role="alert" className="mt-4 break-words text-sm text-ink">{error}</p>
  </>;
}
