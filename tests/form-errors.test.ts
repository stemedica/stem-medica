import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { catalogueSchema, draftSchema } from "../src/lib/cms-schema";
import { postsSchema } from "../src/lib/post-schema";
import { formProblems, UserFacingError, userError } from "../src/lib/form-errors";
import { apiError } from "../src/lib/admin-api";

test("validation messages do not expose schema paths or regex internals", async () => {
  const parsed = z.object({ catalogue: catalogueSchema }).safeParse({ catalogue: { categories: [], products: [{ slug: "BAD URL", name: "", brand: "", origin: "", summary: "", category: "", image: "", leadTime: "On request", availability: "On request", published: false, featured: false, specs: [], services: [] }] } });
  assert.equal(parsed.success, false);
  if (parsed.success) return;
  const problems = formProblems(parsed.error.issues);
  assert.ok(problems.some((p) => p.label === "Product 1 · Brand" && p.message === "Please complete this field."));
  assert.ok(problems.some((p) => p.path === "products.0.slug" && p.message.includes("patient-monitor")));
  const response = await apiError(parsed.error).json();
  assert.equal(/catalogue\.products|regex|pattern|Too small/.test(response.error), false);
  assert.ok(Array.isArray(response.problems));
});
test("published blog requirements point to the missing fields", () => {
  const parsed = postsSchema.safeParse([{ id: randomUUID(), slug: "test", title: "Test", author: "Team", date: "2026-09-16", kind: "Blog", image: "", body: "", excerpt: "", published: true }]);
  assert.equal(parsed.success, false);
  if (parsed.success) return;
  assert.deepEqual(formProblems(parsed.error.issues, "posts").map((p) => p.path), ["0.body"]);
});
test("transport and parser errors are safe while known recovery messages remain useful", () => {
  assert.equal(userError(new SyntaxError("Unexpected token with private data"), "Please retry."), "Please retry.");
  assert.equal(userError(new UserFacingError("Your session expired. Sign in again.")), "Your session expired. Sign in again.");
  const parsed = draftSchema.safeParse({});
  assert.equal(parsed.success, false);
});
