import { z } from "zod";

const short = z.string().trim().min(1).max(200);
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100);
const image = z.string().regex(/^$|^\/media\/[a-f0-9-]+\.(?:jpg|png|webp)$/);
export const categorySchema = z.object({ slug, name: short, short: z.string().trim().max(200).default(""), blurb: z.string().max(800).default(""), image: image.default("") })
  .transform((category) => ({ ...category, short: category.short || category.name }));
export const productSchema = z.object({
  slug, name: short, brand: short, origin: z.string().trim().max(200).default(""), category: z.union([slug, z.literal("")]).default(""), image: image.default(""),
  summary: z.string().trim().max(1500).default(""),
  availability: z.enum(["In stock, Addis Ababa", "Indent order", "On request"]),
  leadTime: z.string().trim().max(200).default(""), featured: z.boolean(), published: z.boolean(),
  specs: z.array(z.object({ label: short, value: z.string().trim().min(1).max(400) })).max(30),
  services: z.array(z.string().trim().min(1).max(300)).max(20),
});
export const catalogueSchema = z.object({
  categories: z.array(categorySchema).max(40), products: z.array(productSchema).max(300),
}).superRefine((data, ctx) => {
  for (const key of ["categories", "products"] as const) {
    const seen = new Set<string>();
    for (const [index, item] of data[key].entries()) {
      if (seen.has(item.slug)) ctx.addIssue({ code: "custom", message: "Duplicate website address", path: [key, index, "slug"] });
      seen.add(item.slug);
    }
  }
  const categories = new Set(data.categories.map((c) => c.slug));
  data.products.forEach((p, i) => {
    if (p.category && !categories.has(p.category)) ctx.addIssue({ code: "custom", message: `Move ${p.name} to an existing category first`, path: ["products", i, "category"] });
  });
});
export const cataloguePickerPageSchema = z.object({
  products: z.array(productSchema),
  page: z.number().int().positive(),
  pages: z.number().int().positive(),
  total: z.number().int().nonnegative(),
});
export type CataloguePickerPage = z.infer<typeof cataloguePickerPageSchema>;
export type Catalogue = z.infer<typeof catalogueSchema>;
export type CmsProduct = z.infer<typeof productSchema>;
export type CmsCategory = z.infer<typeof categorySchema>;

const draftText = z.string().max(2000);
export const draftSchema = z.object({
  issuer: z.object({ name: draftText, address: draftText, tin: draftText, vatReg: draftText, phone: draftText, email: draftText, bank: draftText, account: draftText }),
  doc: z.object({
    number: z.string().max(100), date: z.iso.date(), validity: z.union([z.literal(""), z.iso.date()]),
    currency: z.string().trim().min(1).max(10), includeVat: z.boolean().default(true), vatRate: z.number().min(0).max(100),
    client: z.object({ name: draftText, attn: draftText, address: draftText, tin: draftText }),
    items: z.array(z.object({ id: z.string().min(1).max(100), catalogueSlug: slug.optional(), description: draftText, qty: z.number().positive().max(1e6), unit: z.string().max(30), price: z.number().min(0).max(1e10) })).min(1).max(100).superRefine((items, ctx) => {
      const ids = new Set<string>();
      items.forEach((item, index) => {
        if (ids.has(item.id)) ctx.addIssue({ code: "custom", path: [index, "id"], message: "Duplicate line item identifier" });
        ids.add(item.id);
      });
    }),
    notes: z.string().max(5000), delivery: draftText, payment: draftText,
  }).refine((d) => !d.validity || d.validity >= d.date, { message: "Validity cannot precede the document date", path: ["validity"] }),
});
export const DAYS_7 = 7 * 24 * 60 * 60 * 1000;
export const savedDraftSchema = draftSchema.extend({ id: z.uuid(), createdAt: z.iso.datetime(), expiresAt: z.iso.datetime() });
export type SavedDraft = z.infer<typeof savedDraftSchema>;
export function isExpired(draft: Pick<SavedDraft, "expiresAt">, now = Date.now()) {
  return Date.parse(draft.expiresAt) <= now;
}
