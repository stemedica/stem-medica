import type { Catalogue, CmsProduct } from "./cms-schema";

export type EquipmentPreview = Pick<CmsProduct, "slug" | "name" | "brand" | "image" | "summary">
  & { categoryName: string };
export function homeEquipment(catalogue: Catalogue) {
  const products = catalogue.products.filter(product => product.published)
    .sort((a, b) => Number(b.featured) - Number(a.featured));
  const categoryNames = new Map(catalogue.categories.map(category => [category.slug, category.name]));
  const group = (slug: string, name: string, items: CmsProduct[]) => ({
    slug, name, count: items.length,
    // The homepage lists these in a dropdown rather than a grid, so it can carry
    // the whole category; the cap only bounds the payload for a large catalogue.
    products: items.slice(0, 60).map(({ slug, name, brand, image, summary, category }): EquipmentPreview => ({
      slug, name, brand, image, summary: summary.slice(0, 320),
      categoryName: categoryNames.get(category) ?? "",
    })),
  });
  return [group("", "All equipment", products), ...catalogue.categories.map(category =>
    group(category.slug, category.name, products.filter(product => product.category === category.slug)))];
}
