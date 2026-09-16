import { adminGuard, apiError, json, requestBytes } from "@/lib/admin-api";
import { readObject, writeObject } from "@/lib/storage";

export async function POST(request: Request) {
  const denied = await adminGuard(request); if (denied) return denied;
  try {
    const bytes = await requestBytes(request, 3_000_000);
    let ext = "";
    if (bytes.subarray(0, 3).equals(Buffer.from([255, 216, 255]))) ext = "jpg";
    else if (bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) ext = "png";
    else if (bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP") ext = "webp";
    if (!ext) return json({ error: "Upload a JPEG, PNG or WebP image, up to 3 MB." }, 400);
    const id = `${crypto.randomUUID()}.${ext}`;
    await writeObject(`media/${id}`, bytes, ext === "jpg" ? "image/jpeg" : `image/${ext}`);
    return json({ image: `/media/${id}` });
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
