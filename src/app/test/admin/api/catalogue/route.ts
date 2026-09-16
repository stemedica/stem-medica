import { z } from "zod";
import { createHash } from "node:crypto";
import { revalidateTag, revalidatePath } from "next/cache";
import { adminGuard, apiError, json, requestJson } from "@/lib/admin-api";
import { catalogueSchema } from "@/lib/cms-schema";
import { CATALOGUE_KEY, readCatalogue } from "@/lib/catalogue";
import { writeJson, ConflictError } from "@/lib/storage";

export async function GET(request: Request) {
  const denied = await adminGuard(request); if (denied) return denied;
  try { return json(await readCatalogue()); } catch (e) { return apiError(e); }
}
export async function PUT(request: Request) {
  const denied = await adminGuard(request); if (denied) return denied;
  try {
    const { catalogue, etag } = z.object({ catalogue: catalogueSchema, etag: z.string().nullable() }).parse(await requestJson(request));
    const previous = await readCatalogue();
    if (previous.etag !== etag) throw new ConflictError("Another editor saved changes. Reload the catalogue before saving.");
    if (etag) {
      // Concurrent retries archive the same previous revision only once.
      const revision = createHash("sha256").update(etag).digest("hex");
      try { await writeJson(`catalogue-history/0-${revision}.json`, previous.catalogue); }
      catch (error) { if (!(error instanceof ConflictError)) throw error; }
    }
    const next = await writeJson(CATALOGUE_KEY, catalogue, etag);
    revalidateTag("catalogue", { expire: 0 });
    revalidatePath("/test", "layout");
    return json({ catalogue, etag: next, configured: true });
  } catch (e) { return apiError(e); }
}
