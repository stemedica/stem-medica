import { PostsEditor } from "./PostsEditor";
import { requireAdminPage } from "@/lib/auth/guard";
export default async function PostsPage() {
  await requireAdminPage();
  return <PostsEditor previewMode />;
}
