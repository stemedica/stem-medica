import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { postSlug, readingMinutes } from "../src/lib/post-slug";
import { PostBody } from "../src/components/PostBody";
import { V2Photo } from "../src/components/V2";

test("post URLs normalize titles and resolve collisions", () => {
  assert.equal(postSlug(" New Équipment & News! ", []), "new-equipment-news");
  assert.equal(postSlug("New equipment", ["new-equipment", "new-equipment-2"]), "new-equipment-3");
  assert.equal(postSlug("!!!", []), "post");
  assert.ok(postSlug("a".repeat(200), []).length <= 100);
  assert.equal(readingMinutes(""), 1);
  assert.equal(readingMinutes("word ".repeat(201)), 2);
});

test("article text renders headings and lists without executing HTML", () => {
  const html = renderToStaticMarkup(createElement(PostBody, { body: '## A section\n\nParagraph with **bold text**.\n\n- **Rapid Results**: Direct measurement\n- Second\n\n<script>alert(1)</script>' }));
  assert.match(html, /<h2/);
  assert.match(html, /<strong class="font-semibold text-navy">bold text<\/strong>/);
  assert.match(html, /<li><strong class="font-semibold text-navy">Rapid Results<\/strong>: Direct measurement<\/li>/);
  assert.match(html, /&lt;script&gt;/);
  assert.ok(!html.includes("<script>"));
  assert.ok(!html.includes("**"));
});

test("post covers are omitted entirely when a post has no image", () => {
  // A post without a cover must render no image block: no <img>, and no
  // placeholder standing in for one. Cards that do have a cover still show it.
  const withImage = renderToStaticMarkup(
    createElement(V2Photo, { src: "/media/abc.jpg", label: "A post" }),
  );
  assert.match(withImage, /<img/, "a post with a cover should render an image");

  const placeholder = renderToStaticMarkup(
    createElement(V2Photo, { label: "A post" }),
  );
  assert.doesNotMatch(placeholder, /<img/);
  assert.match(placeholder, /role="img"/, "V2Photo without src is a placeholder, so callers must guard on post.image");
});
