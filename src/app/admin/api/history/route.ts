import { adminGuard, apiError, json } from "@/lib/admin-api";
import { listObjects, readJson } from "@/lib/storage";
import { catalogueSchema } from "@/lib/cms-schema";

export async function GET(request: Request) {
  const denied = await adminGuard(request); if (denied) return denied;
  try {
    const key = new URL(request.url).searchParams.get("key");
    if (key) {
      if (!/^catalogue-history\/\d+-[a-f0-9-]+\.json$/.test(key)) return json({ error: "Invalid version" }, 400);
      const saved = await readJson(key);
      return saved ? json({ catalogue: catalogueSchema.parse(saved.data) }) : json({ error: "Version not found" }, 404);
    }
    const versions = (await listObjects("catalogue-history/")).sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime()).slice(0, 30);
    return json({ versions });
  } catch (e) { return apiError(e); }
}
