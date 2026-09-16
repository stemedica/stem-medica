import { PostsEditor } from "./PostsEditor";
import { requireAdminPage } from "@/lib/auth/guard";
export default async function PostsPage() {
  await requireAdminPage();
  const previewMode = process.env.NODE_ENV !== "production" || (!!process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production");
  return <PostsEditor previewMode={previewMode} />;
}
