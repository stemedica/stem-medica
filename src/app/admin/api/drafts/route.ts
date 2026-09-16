import { z } from "zod";
import { mapConcurrent } from "@/lib/map-concurrent";
import { adminGuard, apiError, json, requestJson } from "@/lib/admin-api";
import { draftSchema, savedDraftSchema, isExpired, DAYS_7 } from "@/lib/cms-schema";
import { readJson, writeJson, listObjects, deleteObject, ConflictError } from "@/lib/storage";

const keyFor = (id: string) => `drafts/${z.uuid().parse(id)}.json`;
export async function GET(request: Request) {
  const denied = await adminGuard(request); if (denied) return denied;
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (id) {
      const saved = await readJson(keyFor(id));
      if (!saved) return json({ error: "Draft not found" }, 404);
      const draft = savedDraftSchema.parse(saved.data);
      if (isExpired(draft)) return json({ error: "This draft has expired" }, 410);
      return json({ draft, etag: saved.etag });
    }
    const entries = await mapConcurrent(await listObjects("drafts/"), 6, async (object) => {
      const saved = await readJson(object.pathname);
      if (!saved) return null;
      const draft = savedDraftSchema.parse(saved.data);
      return isExpired(draft) ? null : { id: draft.id, number: draft.doc.number, client: draft.doc.client.name, expiresAt: draft.expiresAt, etag: saved.etag };
    });
    const drafts = entries.filter((entry) => entry !== null);
    return json({ drafts: drafts.sort((a, b) => b.expiresAt.localeCompare(a.expiresAt)) });
  } catch (e) { return apiError(e); }
}
export async function PUT(request: Request) {
  const denied = await adminGuard(request); if (denied) return denied;
  try {
    const payload = z.object({ id: z.uuid(), etag: z.string().nullable(), draft: draftSchema }).parse(await requestJson(request));
    const key = keyFor(payload.id);
    const previous = await readJson(key);
    if ((previous?.etag ?? null) !== payload.etag) throw new ConflictError("Draft changed in another tab. Reopen it before saving.");
    const old = previous ? savedDraftSchema.parse(previous.data) : null;
    if (old && isExpired(old)) return json({ error: "This draft expired. Start a new proforma." }, 410);
    if (!old && payload.etag) return json({ error: "Draft no longer exists" }, 410);
    const createdAt = old?.createdAt ?? new Date().toISOString();
    const draft = { ...payload.draft, id: payload.id, createdAt, expiresAt: old?.expiresAt ?? new Date(Date.parse(createdAt) + DAYS_7).toISOString() };
    const etag = await writeJson(key, draft, payload.etag);
    return json({ draft, etag });
  } catch (e) { return apiError(e); }
}
export async function DELETE(request: Request) {
  const denied = await adminGuard(request); if (denied) return denied;
  try {
    const { id, etag } = z.object({ id: z.uuid(), etag: z.string() }).parse(await requestJson(request));
    await deleteObject(keyFor(id), etag);
    return json({ deleted: true });
  } catch (e) { return apiError(e); }
}
