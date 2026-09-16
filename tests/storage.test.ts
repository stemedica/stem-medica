import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { readJson, writeJson, listObjects, deleteObject, ConflictError } from "../src/lib/storage";
import { catalogueSchema, isExpired, DAYS_7 } from "../src/lib/cms-schema";

test("storage persists JSON, rejects stale/concurrent writes and protects deletes", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "stem-storage-test-"));
  process.env.STORAGE_DRIVER = "local";
  process.env.LOCAL_STORAGE_DIR = directory;
  try {
    const etag = await writeJson("catalogue/current.json", { version: 1 });
    assert.deepEqual((await readJson("catalogue/current.json"))?.data, { version: 1 });
    await assert.rejects(writeJson("catalogue/current.json", { version: 2 }), ConflictError);
    const writes = await Promise.allSettled([writeJson("catalogue/current.json", { version: 2 }, etag), writeJson("catalogue/current.json", { version: 3 }, etag)]);
    assert.equal(writes.filter((r) => r.status === "fulfilled").length, 1);
    assert.equal((await listObjects("catalogue/")).length, 1);
    await assert.rejects(deleteObject("catalogue/current.json", etag), ConflictError);
    const saved = await readJson("catalogue/current.json");
    await deleteObject("catalogue/current.json", saved!.etag);
    assert.equal(await readJson("catalogue/current.json"), null);
    await assert.rejects(readJson("../escape.json"));
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test("categories cannot be removed while products reference them, and slugs are unique", () => {
  const category = { slug: "icu", name: "ICU", short: "ICU", blurb: "", image: "" };
  const product = { slug: "monitor", name: "Monitor", brand: "Brand", origin: "Origin", category: "icu", image: "", summary: "Monitor", availability: "On request", leadTime: "Confirm", featured: false, published: false, specs: [], services: [] };
  assert.equal(catalogueSchema.safeParse({ categories: [category], products: [product] }).success, true);
  assert.equal(catalogueSchema.safeParse({ categories: [], products: [product] }).success, false);
  assert.equal(catalogueSchema.safeParse({ categories: [category, category], products: [] }).success, false);
});

test("draft expires exactly at seven days", () => {
  const start = Date.parse("2026-09-16T10:00:00Z");
  const draft = { expiresAt: new Date(start + DAYS_7).toISOString() };
  assert.equal(isExpired(draft, start + DAYS_7 - 1), false);
  assert.equal(isExpired(draft, start + DAYS_7), true);
});
