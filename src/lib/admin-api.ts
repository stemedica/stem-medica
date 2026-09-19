import { ZodError } from "zod";
import { ConflictError, StorageUnavailable, ContentTooLarge } from "./storage";
import { UnsupportedImage } from "./image-processing";
import { readSession } from "./auth";
import { hasAdminAccess } from "./auth/policy";
import { formProblems } from "./form-errors";
export async function adminGuard(request: Request) {
  if (!request.headers.get("cookie")) return json({ error: "Please sign in again to continue. Keep your unsaved edits before leaving this page." }, 401);
  try {
    const session = await readSession(request.headers);
    if (!hasAdminAccess(session)) return json({ error: "Please complete admin sign-in to continue. Your edits are still here." }, 401);
  } catch { return json({ error: "We couldn’t verify your sign-in right now. Please try again." }, 503); }
  if (!["GET", "HEAD"].includes(request.method)) {
    const origin = request.headers.get("origin");
    try { if (!origin || new URL(origin).host !== request.headers.get("host")) return json({ error: "For your security, this request was blocked. Keep a copy of your edits, then reload the page and try again." }, 403); }
    catch { return json({ error: "For your security, this request was blocked. Reload the page and try again." }, 403); }
  }
  return null;
}
export function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "private, no-store" } });
}
export async function requestBytes(request: Request, limit = 2_000_000) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error("Empty request");
  const chunks: Uint8Array[] = []; let size = 0;
  while (true) {
    const { value, done } = await reader.read(); if (done) break;
    size += value.length;
    if (size > limit) { await reader.cancel(); throw new Error("Request is too large"); }
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}
export async function requestJson(request: Request) { return JSON.parse((await requestBytes(request)).toString()); }
export function apiError(error: unknown) {
  if (error instanceof ZodError) return json({ error: "Some details need attention. Please check the highlighted fields and try again.", problems: formProblems(error.issues) }, 400);
  if (error instanceof ConflictError) return json({ error: error.message }, 409);
  // 413: the editor can act on this (remove or shorten entries), so it must not
  // fall through to the generic 503 "retry" message, which would be a lie.
  if (error instanceof UnsupportedImage) return json({ error: error.message }, 400);
  if (error instanceof ContentTooLarge) return json({ error: error.message }, 413);
  if (error instanceof StorageUnavailable) return json({ error: "Saving is unavailable right now. Keep this page open and try again, or contact the site owner." }, 503);
  if (error instanceof SyntaxError || (error instanceof Error && ["Empty request", "Request is too large"].includes(error.message))) return json({ error: "We couldn’t read the submitted details, or they are too large. Check your entries and try again." }, 400);
  console.error("Storage operation failed:", error instanceof Error ? error.name : "Unknown error");
  return json({ error: "Storage is unavailable. Your changes have not been confirmed; please retry." }, 503);
}
