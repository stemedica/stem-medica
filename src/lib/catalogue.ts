import { unstable_cache } from "next/cache";
import { catalogueSchema, type Catalogue } from "./cms-schema";
import { readJson, storageReady, contentStorageIdentity } from "./storage";

export const CATALOGUE_KEY = "catalogue/current.json";
export async function readCatalogue() {
  const saved = storageReady() ? await readJson<Catalogue>(CATALOGUE_KEY) : null;
  return { catalogue: saved ? catalogueSchema.parse(saved.data) : { categories: [], products: [] } satisfies Catalogue, etag: saved?.etag ?? null, configured: storageReady() };
}
export const getCatalogue = unstable_cache(async () => {
  const { catalogue } = await readCatalogue();
  return { categories: catalogue.categories, products: catalogue.products.filter((p) => p.published) };
}, ["public-catalogue-no-demo", contentStorageIdentity(), process.env.LOCAL_STORAGE_DIR ?? ".local-storage", process.env.BLOB_STORE_ID ?? "default"], { tags: ["catalogue"], revalidate: 300 });
