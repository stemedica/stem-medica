export function paginate<T>(items: T[], requested: string | string[] | undefined, size = 12) {
  const pages = Math.max(1, Math.ceil(items.length / size));
  const parsed = typeof requested === "string" && /^\d{1,8}$/.test(requested) ? Number(requested) : 1;
  const page = Math.min(pages, Math.max(1, parsed));
  return { items: items.slice((page - 1) * size, page * size), page, pages };
}
