import { headers } from "next/headers";
import { cache } from "react";
import { redirect } from "next/navigation";
import { readSession } from "./index";
import { hasAdminAccess } from "./policy";

// Share the layout/page check within this request only, never across sessions.
export const requireAdminPage = cache(async () => {
  const requestHeaders = await headers();
  if (!requestHeaders.get("cookie")) redirect("/auth/login");
  const value = await readSession(requestHeaders);
  if (!hasAdminAccess(value)) redirect("/auth/login");
});
