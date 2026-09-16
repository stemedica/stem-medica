import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { postSlug, readingMinutes } from "../src/lib/post-slug";
import { PostBody } from "../src/components/PostBody";

test("post URLs normalize titles and resolve collisions", () => {
  assert.equal(postSlug(" New Équipment & News! ", []), "new-equipment-news");
  assert.equal(postSlug("New equipment", ["new-equipment", "new-equipment-2"]), "new-equipment-3");
  assert.equal(postSlug("!!!", []), "post");
  assert.ok(postSlug("a".repeat(200), []).length <= 100);
  assert.equal(readingMinutes(""), 1);
  assert.equal(readingMinutes("word ".repeat(201)), 2);
});

test("article text renders headings and lists without executing HTML", () => {
  const html = renderToStaticMarkup(createElement(PostBody, { body: '## A section\n\nParagraph.\n\n- First\n- Second\n\n<script>alert(1)</script>' }));
  assert.match(html, /<h2/);
  assert.match(html, /<li>First<\/li>/);
  assert.match(html, /&lt;script&gt;/);
  assert.ok(!html.includes("<script>"));
});
