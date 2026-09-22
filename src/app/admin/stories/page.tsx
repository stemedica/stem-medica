import { StoriesEditor } from "./StoriesEditor";
import { requireAdminPage } from "@/lib/auth/guard";

export default async function StoriesPage() {
  await requireAdminPage();
  return <StoriesEditor />;
}
