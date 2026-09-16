import { headers } from "next/headers";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getAuth } from "./index";
import { hasAdminAccess } from "./policy";

// Share the layout/page check within this request only, never across sessions.
export const requireAdminPage = cache(async () => {
  const requestHeaders = await headers();
  if (!requestHeaders.get("cookie")) redirect("/auth/login");
  const value = await getAuth().api.getSession({ headers: requestHeaders, query: { disableCookieCache: true } });
  if (!hasAdminAccess(value)) redirect(value ? "/auth/setup" : "/auth/login");
});
