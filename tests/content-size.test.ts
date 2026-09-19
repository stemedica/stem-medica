import { test } from "node:test";
import assert from "node:assert/strict";
import { catalogueSchema } from "../src/lib/cms-schema";
import { postsSchema } from "../src/lib/post-schema";

const product = (i: number) => ({
  slug: `p-${i}`, name: `Product ${i}`, brand: "Brand", origin: "Origin",
  category: "", image: "", summary: "x".repeat(1500),
  availability: "On request" as const, leadTime: "", featured: false, published: true,
  specs: Array.from({ length: 30 }, (_, n) => ({ label: `L${n}`, value: "y".repeat(400) })),
  services: Array.from({ length: 20 }, () => "z".repeat(300)),
});

const post = (i: number) => ({
  id: `00000000-0000-4000-8000-${String(i).padStart(12, "0")}`,
  slug: `post-${i}`, title: "T".repeat(200), date: "2026-01-01", kind: "Blog" as const,
  excerpt: "e".repeat(500), author: "A", body: "b".repeat(8000), image: "", published: true,
});

test("collection caps are sized so a full document stays storable", () => {
  // Field limits alone multiply out past what a single-document store can carry,
  // which is why storage.ts enforces bytes as well. These caps keep the
  // *realistic* worst case near that budget rather than orders above it.
  const products = Array.from({ length: 300 }, (_, i) => product(i));
  assert.ok(catalogueSchema.safeParse({ categories: [], products }).success);
  assert.equal(catalogueSchema.safeParse({ categories: [], products: [...products, product(300)] }).success, false);

  const posts = Array.from({ length: 60 }, (_, i) => post(i));
  assert.ok(postsSchema.safeParse(posts).success);
  assert.equal(postsSchema.safeParse([...posts, post(60)]).success, false);

  // A realistic document, not a maxed one, must sit far below the byte guard.
  const realistic = Array.from({ length: 300 }, (_, i) => ({
    ...product(i), summary: "x".repeat(300),
    specs: Array.from({ length: 6 }, (_, n) => ({ label: `L${n}`, value: "y".repeat(60) })),
    services: Array.from({ length: 4 }, () => "z".repeat(40)),
  }));
  const bytes = Buffer.byteLength(JSON.stringify({ categories: [], products: realistic }));
  assert.ok(bytes < 500_000, `realistic catalogue should stay well under the guard, got ${bytes}B`);
});

test("oversized individual fields are rejected", () => {
  const tooLong = { ...product(1), summary: "x".repeat(1501) };
  assert.equal(catalogueSchema.safeParse({ categories: [], products: [tooLong] }).success, false);
  assert.equal(postsSchema.safeParse([{ ...post(1), body: "b".repeat(8001) }]).success, false);
});
