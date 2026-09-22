import { getCatalogue } from "@/lib/catalogue";
import { getAllPosts } from "@/lib/post-store";
import { getStories } from "@/lib/story-store";
import { readObject } from "@/lib/storage";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-f0-9-]+\.(jpg|png|webp)$/.test(id)) return new Response(null, { status: 404 });
  try {
    const [catalogue, posts, stories] = await Promise.all([getCatalogue(), getAllPosts(), getStories()]);
    const url = `/media/${id}`;
    if (![...catalogue.categories, ...catalogue.products, ...posts, ...stories].some((p) => p.image === url) && !posts.some(post => post.gallery?.some(image => image.src === url))) return new Response(null, { status: 404 });
    const object = await readObject(`media/${id}`);
    if (!object) return new Response(null, { status: 404 });
    return new Response(new Uint8Array(object.bytes), { headers: { "Content-Type": id.endsWith("jpg") ? "image/jpeg" : `image/${id.split(".").pop()}`, "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" } });
  } catch { return new Response(null, { status: 503 }); }
}
