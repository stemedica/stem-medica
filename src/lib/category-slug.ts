/** Human-readable internal links for newly created categories; saved links stay stable. */
export function categorySlug(name: string, occupied: string[]) {
  const base = name.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 85).replace(/-$/, "") || "category";
  const used = new Set(occupied);
  let candidate = base, suffix = 2;
  while (used.has(candidate)) candidate = `${base}-${suffix++}`;
  return candidate;
}
