import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { localSetupEnabled, localSetupToken, needsLocalAccount } from "@/lib/auth/local-setup";
import { FirstLoginForm } from "./FirstLoginForm";

export default async function FirstLoginPage() {
  await headers();
  if (!localSetupEnabled()) notFound();
  if (!await needsLocalAccount()) redirect("/test/auth/login");
  return <FirstLoginForm email={process.env.ADMIN_EMAILS!.split(",")[0].trim()} token={localSetupToken()} />;
}
