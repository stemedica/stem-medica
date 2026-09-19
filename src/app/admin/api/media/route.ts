import { adminGuard, apiError, json, requestBytes } from "@/lib/admin-api";
import { readObject, writeObject } from "@/lib/storage";
import { processImage } from "@/lib/image-processing";
import { UPLOAD_BODY_LIMIT } from "@/lib/client-image";

// sharp is a native module; keep this route off the edge runtime.
export const runtime = "nodejs";

export async function POST(request: Request) {
  const denied = await adminGuard(request); if (denied) return denied;
  try {
    // The magic-byte sniff stays as a cheap gate before handing bytes to a
    // native decoder; processImage then re-encodes and is the real validation.
    // Vercel rejects bodies over ~4.5 MB with FUNCTION_PAYLOAD_TOO_LARGE before this
    // handler runs, so accepting more here would be a promise the platform breaks.
    // The browser downscales first (lib/client-image.ts), so this only ever sees
    // already-shrunk bytes.
    const upload = await requestBytes(request, UPLOAD_BODY_LIMIT);
    const isJpeg = upload.subarray(0, 3).equals(Buffer.from([255, 216, 255]));
    const isPng = upload.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    const isWebp = upload.toString("ascii", 0, 4) === "RIFF" && upload.toString("ascii", 8, 12) === "WEBP";
    if (!isJpeg && !isPng && !isWebp) return json({ error: "Upload a JPEG, PNG or WebP image, up to 10 MB." }, 400);

    const image = await processImage(upload);
    const id = `${crypto.randomUUID()}.${image.ext}`;
    await writeObject(`media/${id}`, image.bytes, image.contentType);
    return json({
      image: `/media/${id}`,
      width: image.width,
      height: image.height,
      bytes: image.bytes.byteLength,
      originalBytes: image.originalBytes,
    });
  } catch (e) { return apiError(e); }
}
export async function GET(request: Request) {
  const denied = await adminGuard(request); if (denied) return denied;
  try {
    const id = new URL(request.url).searchParams.get("id") ?? "";
    if (!/^[a-f0-9-]+\.(jpg|png|webp)$/.test(id)) return json({ error: "Invalid image" }, 400);
    const object = await readObject(`media/${id}`);
    if (!object) return json({ error: "Not found" }, 404);
    return new Response(new Uint8Array(object.bytes), { headers: { "Content-Type": id.endsWith("jpg") ? "image/jpeg" : `image/${id.split(".").pop()}`, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
  } catch (e) { return apiError(e); }
}
