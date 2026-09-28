import { adminGuard, apiError, json, requestBytes } from "@/lib/admin-api";
import { readObject, writeObject } from "@/lib/storage";
import { imageKind } from "@/lib/image-signature";
import { UPLOAD_BODY_LIMIT } from "@/lib/client-image";

export async function POST(request: Request) {
  const denied = await adminGuard(request); if (denied) return denied;
  try {
    // Vercel rejects bodies over ~4.5 MB with FUNCTION_PAYLOAD_TOO_LARGE before
    // this handler runs. The browser downscales first, so this only ever sees
    // already-shrunk bytes.
    const upload = await requestBytes(request, UPLOAD_BODY_LIMIT);

    // Header inspection only. The bytes are never decoded here: image parsers
    // are a recurring source of memory-safety bugs and this is untrusted input.
    const kind = imageKind(upload);
    if (!kind) return json({ error: "Upload a JPEG, PNG or WebP image." }, 400);

    const id = `${crypto.randomUUID()}.${kind.ext}`;
    await writeObject(`media/${id}`, upload, kind.contentType);
    return json({ image: `/media/${id}`, bytes: upload.byteLength });
  } catch (e) { return apiError(e); }
}
export async function GET(request: Request) {
  const denied = await adminGuard(request); if (denied) return denied;
  try {
    const id = new URL(request.url).searchParams.get("id") ?? "";
    if (!/^[a-z0-9-]+\.(jpg|png|webp)$/.test(id)) return json({ error: "Invalid image" }, 400);
    const object = await readObject(`media/${id}`);
    if (!object) return json({ error: "Not found" }, 404);
    return new Response(new Uint8Array(object.bytes), { headers: { "Content-Type": id.endsWith("jpg") ? "image/jpeg" : `image/${id.split(".").pop()}`, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
  } catch (e) { return apiError(e); }
}
