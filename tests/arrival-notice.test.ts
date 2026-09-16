import test from "node:test";
import assert from "node:assert/strict";
import { arrivalNoticeEnd, hasArrivalNotice, arrivalLabel } from "../src/lib/arrival-notice";
import { postSchema } from "../src/lib/post-schema";
import { formProblems } from "../src/lib/form-errors";

const post = { kind: "New arrival" as const, date: "2026-09-17" };
test("default notice lasts 90 calendar days including display day in Addis Ababa", () => {
  assert.equal(arrivalNoticeEnd(post), "2026-12-15");
  assert.equal(hasArrivalNotice(post, Date.parse("2026-09-16T20:59:59Z")), false);
  assert.equal(hasArrivalNotice(post, Date.parse("2026-09-16T21:00:00Z")), true);
  assert.equal(hasArrivalNotice(post, Date.parse("2026-12-15T20:59:59Z")), true);
  assert.equal(hasArrivalNotice(post, Date.parse("2026-12-15T21:00:00Z")), false);
  assert.equal(arrivalLabel(post, Date.parse("2027-01-01")), "Arrival update");
});
test("custom end dates, disabled notices, blog posts and leap years", () => {
  const now = Date.parse("2026-09-20");
  assert.equal(hasArrivalNotice({ ...post, arrivalNoticeUntil: "2026-09-18" }, now), false);
  assert.equal(hasArrivalNotice({ ...post, arrivalNoticeEnabled: false }, now), false);
  assert.equal(hasArrivalNotice({ ...post, kind: "Blog" }, now), false);
  assert.equal(arrivalLabel({ ...post, kind: "Upcoming arrival" }, now), "Upcoming arrival");
  assert.equal(arrivalNoticeEnd({ date: "2028-02-01" }), "2028-04-30");
  assert.equal(arrivalNoticeEnd({ date: "" }), "");
});
test("CMS preserves custom notice fields and explains invalid expiry", () => {
  const input = { ...post, id: "01994ddd-1000-4000-8000-000000000001", slug: "arrival", title: "Arrival", body: "Details", image: "", published: true, arrivalNoticeUntil: "2026-11-17", arrivalNoticeEnabled: true };
  assert.equal(postSchema.parse(input).arrivalNoticeUntil, "2026-11-17");
  const bad = postSchema.safeParse({ ...input, arrivalNoticeUntil: "2026-09-01" });
  assert.equal(bad.success, false);
  if (!bad.success) assert.match(formProblems(bad.error.issues)[0].message, /on or after the display date/);
  assert.equal(postSchema.safeParse({ ...input, arrivalNoticeUntil: "not-a-date" }).success, false);
});
