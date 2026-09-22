import { z } from "zod";
import { revalidatePath, revalidateTag } from "next/cache";
import { adminGuard, apiError, json, requestJson } from "@/lib/admin-api";
import { storiesSchema } from "@/lib/story-schema";
import { STORIES_KEY, readStories } from "@/lib/story-store";
import { writeJson } from "@/lib/storage";

export async function GET(request: Request) {
  const denied = await adminGuard(request); if (denied) return denied;
  try { return json(await readStories()); } catch (error) { return apiError(error); }
}

export async function PUT(request: Request) {
  const denied = await adminGuard(request); if (denied) return denied;
  try {
    const { stories, etag } = z.object({ stories: storiesSchema, etag: z.string().nullable() }).parse(await requestJson(request));
    const next = await writeJson(STORIES_KEY, stories, etag);
    revalidateTag("stories", { expire: 0 }); revalidatePath("", "layout");
    return json({ stories, etag: next });
  } catch (error) { return apiError(error); }
}
