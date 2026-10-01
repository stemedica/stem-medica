import { redirect } from "next/navigation";
import { requireAdminPage } from "@/lib/auth/guard";

export default async function StoriesPage() {
  await requireAdminPage();
  redirect("/admin/posts");
}
