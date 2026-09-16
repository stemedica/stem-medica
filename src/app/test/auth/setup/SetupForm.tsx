"use client";
/* eslint-disable @next/next/no-location-assign-relative-destination -- Full navigation clears the pre-MFA router state. */
import { useState } from "react";
import QRCode from "react-qr-code";
import { authClient } from "@/lib/auth/client";
import { SignOut } from "@/components/SignOut";
import Link from "next/link";
import { UserFacingError, userError } from "@/lib/form-errors";
const input = "mt-2 block w-full min-w-0 rounded-lg border border-hair px-3 py-3 focus-visible:outline-2 focus-visible:outline-navy";
export function SetupForm() {
  const [password, setPassword] = useState(""); const [uri, setUri] = useState(""); const [codes, setCodes] = useState<string[]>([]);
  const [code, setCode] = useState(""); const [saved, setSaved] = useState(false); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  return <>
    <h1 className="font-display text-3xl font-semibold">Set up your authenticator</h1>
    <p className="mt-3 text-sm leading-relaxed text-ink-soft">Optional extra protection. Your email and password already give you admin access. If you enable this, future sign-ins will also need an authenticator code.</p>
    <Link href="/test/admin" className="mt-4 inline-block text-sm underline underline-offset-4">Skip for now · Back to admin</Link>
    <form className="mt-6" onSubmit={async (event) => {
      event.preventDefault(); setBusy(true); setError("");
      try {
        if (!uri) {
          const result = await authClient.twoFactor.enable({ password, method: "totp" });
          if (result.error || !result.data) throw new UserFacingError("Unable to start setup. Check your password and try again.");
          if (result.data.method !== "totp") throw new UserFacingError("Authenticator setup is unavailable. Please try again later.");
          setUri(result.data.totpURI); setCodes(result.data.backupCodes); setPassword("");
        } else {
          const result = await authClient.twoFactor.verifyTotp({ code, trustDevice: false });
          if (result.error) throw new UserFacingError("That code wasn’t accepted. Enter the current six-digit code from your authenticator.");
          setUri(""); setCodes([]); setCode(""); window.location.assign("/test/admin");
        }
      } catch (failure) { setError(userError(failure, "We couldn’t connect. Keep this page open and try setup again.")); }
      finally { setBusy(false); }
    }}><fieldset disabled={busy} className="space-y-5 disabled:opacity-70">
      {!uri ? <label className="block text-sm">Confirm password<input className={input} type="password" autoComplete="current-password" required value={password} maxLength={128} onChange={(event) => setPassword(event.target.value)} /></label> : <>
        <div className="mx-auto max-w-[240px] bg-white p-3"><QRCode value={uri} size={216} style={{ width: "100%", height: "auto" }} aria-label="Authenticator setup QR code" /></div>
        <details className="text-sm"><summary className="cursor-pointer underline">Can’t scan? Enter the setup key manually</summary><p className="mt-2 break-all font-mono">{new URL(uri).searchParams.get("secret")}</p></details>
        <div className="border-y border-hair py-4"><h2 className="font-semibold">Save your recovery codes</h2><p className="mt-2 text-sm text-ink-soft">Store these in your password manager. Each works once if you lose access to your authenticator.</p><ul className="mt-3 grid grid-cols-2 gap-2 font-mono text-sm">{codes.map((item) => <li key={item}>{item}</li>)}</ul></div>
        <label className="flex items-start gap-3 text-sm"><input className="mt-1" type="checkbox" required checked={saved} onChange={(event) => setSaved(event.target.checked)} />I saved my recovery codes somewhere safe.</label>
        <label className="block text-sm">Authenticator code<input className={input} inputMode="numeric" pattern="[0-9]{6}" autoComplete="one-time-code" maxLength={6} required value={code} onChange={(event) => setCode(event.target.value)} /></label>
      </>}
      <button type="submit" className="btn-primary w-full" disabled={!!uri && !saved}>{busy ? "Checking…" : uri ? "Verify and finish setup" : "Generate setup QR code"}</button>
    </fieldset></form>
    <p role="alert" className="mt-4 break-words text-sm">{error}</p><div className="mt-5 text-sm"><SignOut /></div>
  </>;
}
