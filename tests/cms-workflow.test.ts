import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { catalogueSchema, categorySchema } from "../src/lib/cms-schema";
import { postSchema } from "../src/lib/post-schema";
import { postSummary } from "../src/lib/post-slug";

test("products require name and brand but can be uncategorised with no optional text", () => {
  const product = { slug: "monitor", name: "Monitor", brand: "Brand", availability: "On request", specs: [], services: [], featured: false, published: false };
  const parsed = catalogueSchema.parse({ categories: [], products: [product] });
  assert.equal(parsed.products[0].category, "");
  assert.equal(parsed.products[0].origin, "");
  assert.equal(catalogueSchema.safeParse({ ...parsed, products: [{ ...product, brand: " " }] }).success, false);
  assert.equal(catalogueSchema.safeParse({ ...parsed, products: [{ ...product, name: " " }] }).success, false);
  assert.equal(catalogueSchema.safeParse({ ...parsed, products: [{ ...product, category: "missing" }] }).success, false);
  assert.equal(categorySchema.parse({ slug: "icu", name: "Critical care" }).short, "Critical care");
});

test("blog summaries are optional while publishing still requires an article", () => {
  const draft = { id: randomUUID(), slug: "news", title: "News", date: "2026-09-16", kind: "Blog", body: "", image: "", published: false };
  assert.equal(postSchema.safeParse(draft).success, true);
  assert.equal(postSchema.safeParse({ ...draft, published: true }).success, false);
  const published = postSchema.parse({ ...draft, published: true, body: "## Arrival\n\nNew equipment is here." });
  assert.equal(postSummary(published), "Arrival New equipment is here.");
  assert.equal(postSummary({ ...published, excerpt: "Custom introduction" }), "Custom introduction");
});
