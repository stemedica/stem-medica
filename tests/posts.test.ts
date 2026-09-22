import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { postSchema, postsSchema } from "../src/lib/post-schema";
test("post validation protects publishing and unique slugs", () => {
  const draft = { id: randomUUID(), slug: "arrival", title: "Arrival", date: "2026-09-16", kind: "Upcoming arrival", excerpt: "", author: "Team", body: "", image: "", published: false };
  assert.equal(postSchema.safeParse(draft).success, true);
  assert.equal(postSchema.safeParse({ ...draft, published: true }).success, false);
  assert.equal(postsSchema.safeParse([draft, { ...draft, id: randomUUID() }]).success, false);
  assert.equal(postSchema.safeParse({ ...draft, image: "https://bad.example/image.svg" }).success, false);
  assert.equal(postSchema.safeParse({ ...draft, published: true, body: "Details", excerpt: "Summary" }).success, true);
  const picture = { src: "/media/abcd.webp", alt: "Equipment detail", caption: "An example" };
  assert.equal(postSchema.safeParse({ ...draft, gallery: [picture] }).success, true);
  assert.equal(postSchema.safeParse({ ...draft, gallery: [picture, picture] }).success, false);
  assert.equal(postSchema.safeParse({ ...draft, gallery: [{ ...picture, src: "https://example.com/private.png" }] }).success, false);
  assert.equal(postSchema.safeParse({ ...draft, gallery: Array.from({ length: 9 }, (_, i) => ({ ...picture, src: `/media/abc${i}.webp` })) }).success, false);
});
