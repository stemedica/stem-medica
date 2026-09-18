import { z } from "zod";
import { revalidatePath, revalidateTag } from "next/cache";
import { adminGuard, apiError, json, requestJson } from "@/lib/admin-api";
import { postsSchema } from "@/lib/post-schema";
import { POSTS_KEY, readPosts } from "@/lib/post-store";
import { writeJson } from "@/lib/storage";
export async function GET(request: Request) {
  const denied = await adminGuard(request); if (denied) return denied;
  try { return json(await readPosts()); } catch (error) { return apiError(error); }
}
export async function PUT(request: Request) {
  const denied = await adminGuard(request); if (denied) return denied;
  try {
    const { posts, etag } = z.object({ posts: postsSchema, etag: z.string().nullable() }).parse(await requestJson(request));
    const next = await writeJson(POSTS_KEY, posts, etag);
    revalidateTag("posts", { expire: 0 }); revalidatePath("", "layout");
    return json({ posts, etag: next });
  } catch (error) { return apiError(error); }
}
