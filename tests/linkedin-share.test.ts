import test from "node:test";
import assert from "node:assert/strict";
import { linkedInShare } from "../src/lib/linkedin-share";

test("LinkedIn copy includes the canonical article link and summary", () => {
  const result = linkedInShare({ slug: "equipment-guide", title: "Equipment guide", excerpt: "Our checklist", body: "Full article" });
  assert.equal(result.url, "https://stemedicaet.com/blog/equipment-guide");
  assert.equal(result.text, "Equipment guide\n\nOur checklist\n\nRead the full article: https://stemedicaet.com/blog/equipment-guide");
});
