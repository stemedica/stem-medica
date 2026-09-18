import { timingSafeEqual, createHash } from "node:crypto";
import { listObjects, readJson, deleteObject } from "@/lib/storage";
import { savedDraftSchema, isExpired } from "@/lib/cms-schema";
import { authDatabase } from "@/lib/auth/database";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const hash = (s: string) => createHash("sha256").update(s).digest();
  if (!secret || !timingSafeEqual(hash(request.headers.get("authorization") ?? ""), hash(`Bearer ${secret}`))) return new Response(null, { status: 401 });
  let deleted = 0;
  try {
    for (const object of await listObjects("drafts/")) {
      const saved = await readJson(object.pathname);
      if (saved && isExpired(savedDraftSchema.parse(saved.data))) { await deleteObject(object.pathname, saved.etag); deleted++; }
    }
    const sessions = await authDatabase().pool.query('DELETE FROM auth_session WHERE "expiresAt" < NOW() RETURNING id');
    const throttles = await authDatabase().pool.query('DELETE FROM auth_throttle WHERE "expiresAt" < NOW() - INTERVAL \'1 day\' RETURNING key');
    return Response.json({ deleted, expiredSessions: sessions.rowCount, expiredThrottles: throttles.rowCount }, { headers: { "Cache-Control": "no-store" } });
  } catch { return Response.json({ error: "Cleanup failed; retry required", deleted }, { status: 503 }); }
}
