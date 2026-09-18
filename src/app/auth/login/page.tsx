import { LoginForm } from "./LoginForm";
import { headers } from "next/headers";
import Link from "next/link";
import { needsLocalAccount } from "@/lib/auth/local-setup";
export default async function LoginPage() {
  await headers();
  let firstLogin = false;
  try { firstLogin = await needsLocalAccount(); }
  catch { return <><h1 className="font-display text-3xl font-semibold">Start your local database</h1><p className="mt-4 text-sm">Run <code>npm run local:setup</code> in the project terminal, then refresh this page. Your existing account will be kept.</p></>; }
  if (firstLogin) return <><h1 className="font-display text-3xl font-semibold">Welcome to STEM MEDICA</h1><p className="my-5 text-sm leading-relaxed text-ink-soft">Create your password to start managing products, posts and proformas. No QR setup is needed.</p><Link className="btn-primary w-full" href="/auth/first-login">Create your admin account</Link><p className="mt-4 text-xs text-steel">One-time setup · Local development only</p></>;
  return <LoginForm />;
}
