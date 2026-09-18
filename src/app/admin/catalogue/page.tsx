import { CatalogueEditor } from "./CatalogueEditor";
import { requireAdminPage } from "@/lib/auth/guard";

export default async function CataloguePage() {
  await requireAdminPage();
  return <CatalogueEditor />;
}
