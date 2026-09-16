/** Generate once while composing; never change a saved article's address. */
export function postSlug(title: string, occupied: string[]) {
  const base = title.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 85).replace(/-$/, "") || "post";
  const used = new Set(occupied);
  let candidate = base, suffix = 2;
  while (used.has(candidate)) candidate = `${base}-${suffix++}`;
  return candidate;
}

export function readingMinutes(body: string) {
  return Math.max(1, Math.ceil(body.trim().split(/\s+/).filter(Boolean).length / 200));
}

export function postSummary(post: { excerpt: string; body: string }) {
  if (post.excerpt.trim()) return post.excerpt;
  const text = post.body.replace(/^\s*(?:#{1,3}|-)\s+/gm, "").replace(/\s+/g, " ").trim();
  return text.length > 180 ? `${text.slice(0, 177).trimEnd()}…` : text;
}

export function postSections(body: string) {
  return body.split(/\r?\n\s*\r?\n/).filter(Boolean).flatMap((block, index) => {
    const text = block.trim();
    return /^#{2,3} [^\n\r]+$/.test(text) ? [{ id: `section-${index}`, title: text.replace(/^#{2,3} /, "") }] : [];
  });
}
