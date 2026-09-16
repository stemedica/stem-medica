import { createHmac } from "node:crypto";
import { authDatabase } from "./database";
import { user } from "./schema";

// This is a local-development provisioning flow, never a production signup route.
export function localSetupEnabled() {
  if (process.env.NODE_ENV !== "development" || process.env.VERCEL || process.env.LOCAL_AUTH_SETUP !== "1") return false;
  try {
    const db = new URL(process.env.DATABASE_URL!);
    const origin = new URL(process.env.BETTER_AUTH_URL!);
    return ["127.0.0.1", "localhost"].includes(db.hostname)
      && ["/stem_medica_local", "/stem_medica_auth_qa"].includes(db.pathname)
      && ["127.0.0.1", "localhost"].includes(origin.hostname)
      && (process.env.BETTER_AUTH_SECRET?.length ?? 0) >= 32;
  } catch { return false; }
}
export function localSetupToken() {
  if (!localSetupEnabled()) throw new Error("Local setup is disabled");
  return createHmac("sha256", process.env.BETTER_AUTH_SECRET!).update("stem-medica:first-local-account:v1").digest("hex");
}
export async function needsLocalAccount() {
  if (!localSetupEnabled()) return false;
  return (await authDatabase().db.select({ id: user.id }).from(user).limit(1)).length === 0;
}
