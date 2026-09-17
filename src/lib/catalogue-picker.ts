import type { Catalogue } from "./cms-schema";
import { paginate } from "./pagination";

export const CATALOGUE_PICKER_PAGE_SIZE = 8;

export function cataloguePickerPage(
  catalogue: Catalogue,
  query: string,
  requestedPage: string | undefined,
  size = CATALOGUE_PICKER_PAGE_SIZE,
) {
  const categoryNames = new Map(catalogue.categories.map((category) => [category.slug, category.name]));
  const needle = query.trim().toLocaleLowerCase();
  const matches = catalogue.products.filter((product) => {
    if (!product.published) return false;
    if (!needle) return true;
    const searchable = `${product.name} ${product.brand} ${categoryNames.get(product.category) ?? ""}`;
    return searchable.toLocaleLowerCase().includes(needle);
  });
  const result = paginate(matches, requestedPage, size);
  return { products: result.items, page: result.page, pages: result.pages, total: matches.length };
}
