import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { getCatalogue } from "@/lib/catalogue";
import { getAllPosts } from "@/lib/post-store";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [catalogue, posts] = await Promise.all([getCatalogue(), getAllPosts()]);
  const staticRoutes = ["", "/products", "/service", "/blog", "/about", "/contact", "/quote", "/partnership"];
  return [
    ...staticRoutes.map((pathname) => ({ url: `${site.url}${pathname}`, changeFrequency: "weekly" as const, priority: pathname === "" ? 1 : 0.7 })),
    ...catalogue.products.map((product) => ({ url: `${site.url}/products/${product.slug}`, changeFrequency: "weekly" as const, priority: 0.6 })),
    ...posts.map((post) => ({ url: `${site.url}/blog/${post.slug}`, lastModified: new Date(`${post.date}T12:00:00Z`), changeFrequency: "monthly" as const, priority: 0.5 })),
  ];
}
