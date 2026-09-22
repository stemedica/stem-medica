import { test } from "node:test";
import assert from "node:assert/strict";
import { blankStory, storiesSchema, storySchema } from "../src/lib/story-schema";

test("a new achievement starts unpublished so nothing reaches the homepage by accident", () => {
  const story = blankStory();
  assert.equal(story.published, false);
  assert.match(story.id, /^[0-9a-f-]{36}$/);
});

test("an achievement needs both what was done and where", () => {
  const base = { ...blankStory(), title: "Equipping an intensive care unit", place: "Adama" };
  assert.equal(storySchema.safeParse(base).success, true);
  assert.equal(storySchema.safeParse({ ...base, title: "  " }).success, false);
  assert.equal(storySchema.safeParse({ ...base, place: "" }).success, false);
});

test("only media-route images are accepted, so no remote URL can be injected", () => {
  const base = { ...blankStory(), title: "A", place: "B" };
  assert.equal(storySchema.safeParse({ ...base, image: "/media/0f9a1b2c-3d4e-5f60-7182-93a4b5c6d7e8.jpg" }).success, true);
  assert.equal(storySchema.safeParse({ ...base, image: "https://example.com/x.jpg" }).success, false);
  assert.equal(storySchema.safeParse({ ...base, image: "" }).success, true);
});

test("the collection is bounded", () => {
  const one = { ...blankStory(), title: "A", place: "B" };
  assert.equal(storiesSchema.safeParse(Array.from({ length: 60 }, () => ({ ...one, id: crypto.randomUUID() }))).success, true);
  assert.equal(storiesSchema.safeParse(Array.from({ length: 61 }, () => ({ ...one, id: crypto.randomUUID() }))).success, false);
});
