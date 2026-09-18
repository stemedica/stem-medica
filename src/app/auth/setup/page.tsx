import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { approvedAdmin, hasAdminAccess } from "@/lib/auth/policy";
import { SetupForm } from "./SetupForm";
import { SignOut } from "@/components/SignOut";
import Link from "next/link";
export default async function SetupPage() {
  const requestHeaders = await headers();
  const session = await getAuth().api.getSession({ headers: requestHeaders, query: { disableCookieCache: true } });
  if (!session) redirect("/auth/login");
  if (!approvedAdmin(session.user.email)) return <><p>This account is not approved.</p><SignOut /></>;
  if (session.user.twoFactorEnabled && hasAdminAccess(session)) return <><h1 className="font-display text-3xl font-semibold">Authenticator enabled</h1><p className="my-5 text-sm">Your account uses a password and authenticator code when signing in. Keep your recovery codes somewhere safe.</p><Link href="/admin" className="btn-primary w-full">Back to admin</Link></>;
  if (session.user.twoFactorEnabled) return <><p className="mb-5">This session has not passed two-factor verification. Sign out and sign in again using your authenticator.</p><SignOut /></>;
  return <SetupForm />;
}
