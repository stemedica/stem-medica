import type { Catalogue, CmsProduct } from "./cms-schema";

export type EquipmentPreview = Pick<CmsProduct, "slug" | "name" | "brand" | "image" | "summary">
  & { categoryName: string };
export function homeEquipment(catalogue: Catalogue) {
  const products = catalogue.products.filter(product => product.published)
    .sort((a, b) => Number(b.featured) - Number(a.featured));
  const categoryNames = new Map(catalogue.categories.map(category => [category.slug, category.name]));
  const group = (slug: string, name: string, items: CmsProduct[]) => ({
    slug, name, count: items.length,
    products: items.slice(0, 6).map(({ slug, name, brand, image, summary, category }): EquipmentPreview => ({
      slug, name, brand, image, summary: summary.slice(0, 180),
      categoryName: categoryNames.get(category) ?? "",
    })),
  });
  return [group("", "All equipment", products), ...catalogue.categories.map(category =>
    group(category.slug, category.name, products.filter(product => product.category === category.slug)))];
}
