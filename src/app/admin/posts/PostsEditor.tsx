"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PublicationFilter, matchesPublication, type PublicationStatus } from "@/components/PublicationFilter";
import { postSlug, postSummary } from "@/lib/post-slug";
import { PostBody } from "@/components/PostBody";
import { useFieldValidation } from "@/components/useFieldValidation";
import { useAdminFeedback } from "@/components/useAdminFeedback";
import { AdminSaveBar } from "@/components/AdminSaveBar";
import { formProblems, type FormProblem, UserFacingError, userError } from "@/lib/form-errors";
import { FormProblems, FieldProblem, fieldProblemProps, focusProblem } from "@/components/FormProblems";
import { postKinds, postsSchema, type CmsPost } from "@/lib/post-schema";
import { PostGallery } from "@/components/PostGallery";
import { arrivalNoticeEnd, hasArrivalNotice } from "@/lib/arrival-notice";
import { LinkedInSharePanel } from "@/components/LinkedInSharePanel";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { useConfirmation, useUnsavedChanges } from "@/components/ConfirmationModal";

const input = "mt-1 block w-full min-w-0 rounded-lg border border-hair bg-white px-3 py-2 text-base focus-visible:outline-2 focus-visible:outline-navy";
type Snapshot = { posts: CmsPost[]; etag: string | null };
async function fetchPosts(): Promise<Snapshot> {
  const response = await fetch("/admin/api/posts", { cache: "no-store" });
  const body = await response.json();
  if (!response.ok) throw new UserFacingError(body.error);
  return { posts: postsSchema.parse(body.posts), etag: body.etag };
}

export function PostsEditor({ previewMode = true }: { previewMode?: boolean }) {
  const saving = useRef(false);
  const [publishTarget, setPublishTarget] = useState<string | null>(null);
  const [status, setStatus] = useState<PublicationStatus>("all");
  const [attempted, setAttempted] = useState(false);
  const [focusTarget, setFocusTarget] = useState("");
  const newPosts = useRef(new Set<string>());
  const { confirm, confirmationModal } = useConfirmation();
  const [posts, setPosts] = useState<CmsPost[]>([]);
  const [etag, setEtag] = useState<string | null>(null);
  const [saved, setSaved] = useState("[]");
  const [selected, setSelected] = useState("");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const { message, tone, setMessage } = useAdminFeedback("Loading posts…");
  const [preview, setPreview] = useState(false);
  const serializedPosts = useMemo(() => JSON.stringify(posts), [posts]);
  const dirty = saved !== serializedPosts;
  const current = posts.find((post) => post.id === selected);
  const validation = useMemo(() => postsSchema.safeParse(publishTarget ? posts.map((p) => p.id === publishTarget ? { ...p, published: true } : p) : posts), [posts, publishTarget]);
  const allProblems = validation && !validation.success ? formProblems(validation.error.issues, "posts") : [];
  const fieldPath = (key: string) => `${posts.findIndex((post) => post.id === selected)}.${key}`;
  const { problems, onBlurCapture, resetFields } = useFieldValidation(allProblems, attempted);
  function selectProblem(problem: FormProblem) {
    const post = posts[Number(problem.path.split(".")[0])];
    if (post) { setSelected(post.id); setStatus("all"); }
    setPreview(false); setFocusTarget(problem.path); focusProblem(problem.path);
  }
  useEffect(() => { if (focusTarget) focusProblem(focusTarget); }, [focusTarget, selected, preview, attempted]);

  const accept = useCallback((snapshot: Snapshot) => {
    resetFields(); setAttempted(false); setPublishTarget(null); newPosts.current.clear();
    setPosts(snapshot.posts); setEtag(snapshot.etag); setSaved(JSON.stringify(snapshot.posts));
    setSelected(snapshot.posts[0]?.id ?? ""); setLoaded(true); setMessage("Posts loaded.");
  }, [resetFields, setMessage]);
  useEffect(() => {
    let active = true;
    fetchPosts().then((snapshot) => { if (active) accept(snapshot); }).catch(() => { if (active) setMessage("Unable to load posts. Use Reload to retry.", "error"); }).finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, [accept, setMessage]);
  useUnsavedChanges(dirty, confirm);
  async function reload() {
    if (dirty && !await confirm({ title: "Discard unsaved changes?", message: "Reload saved posts? Your current unsaved edits will be lost.", action: "Discard and reload" })) return;
    setBusy(true);
    try { accept(await fetchPosts()); } catch { setMessage("Unable to load posts. Please retry.", "error"); }
    finally { setBusy(false); }
  }
  function patch(change: Partial<CmsPost>) { setPosts((items) => items.map((post) => post.id === selected ? { ...post, ...change, ...(change.title !== undefined && newPosts.current.has(post.id) ? { slug: postSlug(change.title, items.filter((item) => item.id !== post.id).map((item) => item.slug)) } : {}) } : post)); }
  function add() {
    const empty = posts.find((post) => newPosts.current.has(post.id) && post.title === "New post" && !post.excerpt && !post.body && !post.image);
    if (empty) { setSelected(empty.id); setPreview(false); setMessage("Your new post is ready to edit. Give it a title before adding another."); return; }
    if (posts.length >= 100) return;
    resetFields(); setAttempted(false); setPublishTarget(null); setStatus("all");
    const id = crypto.randomUUID();
    newPosts.current.add(id);
    setPosts((items) => [...items, { id, slug: postSlug("New post", items.map((item) => item.slug)), title: "New post", date: new Date().toISOString().slice(0, 10), kind: "Blog", excerpt: "", author: "STEM MEDICA", body: "", image: "", published: false }]);
    setSelected(id); setPreview(false);
  }
  async function save(published?: boolean) {
    if (busy || saving.current || !loaded || (!dirty && published === undefined)) return;
    const candidate = published === undefined ? posts : posts.map((post) => post.id === selected ? { ...post, published } : post);
    const parsed = postsSchema.safeParse(candidate);
    setAttempted(true); setPublishTarget(published === true ? selected : null);
    if (!parsed.success) { const issues = formProblems(parsed.error.issues, "posts"); setMessage(""); selectProblem(issues[0]); return; }
    saving.current = true; setBusy(true); setMessage("Saving posts…");
    try {
      const response = await fetch("/admin/api/posts", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ posts: parsed.data, etag }) });
      const result = await response.json(); if (!response.ok) throw new UserFacingError(result.error);
      newPosts.current.clear(); setPublishTarget(null); setAttempted(false);
      setPosts(result.posts); setEtag(result.etag); setSaved(JSON.stringify(result.posts)); setMessage(published === true ? "Post published. It is now visible on the website." : published === false ? "Post unpublished. Its content is safely kept as a draft." : "Saved. Drafts stay private; published content is updated.", "success");
    } catch (error) { setMessage(userError(error, "Save failed. Your edits are still here."), "error"); }
    finally { saving.current = false; setBusy(false); }
  }
  async function upload(file?: File) {
    if (!file) return;
    if (file.size > 8_000_000) { setMessage("Choose an image under 8 MB.", "error"); return; }
    setBusy(true); setMessage("Uploading image…");
    try {
      const response = await fetch("/admin/api/media", { method: "POST", body: file });
      const result = await response.json(); if (!response.ok) throw new UserFacingError(result.error);
      patch({ image: result.image }); setMessage("Image uploaded. Save posts to keep this change.");
    } catch (error) { setMessage(userError(error, "Upload failed."), "error"); }
    finally { setBusy(false); }
  }
  async function uploadGallery(files: File[]) {
    if (!current || busy || !files.length) return;
    const gallery = [...(current.gallery ?? [])];
    if (gallery.length + files.length > 8) { setMessage("You can add up to 8 gallery images. Choose fewer files.", "error"); return; }
    if (files.some(file => file.size > 8_000_000 || !["image/jpeg", "image/png", "image/webp"].includes(file.type))) { setMessage("Choose JPEG, PNG or WebP images under 8 MB each.", "error"); return; }
    const unique = files.filter((file, i) => files.findIndex(other => other.name === file.name && other.size === file.size && other.lastModified === file.lastModified) === i);
    setBusy(true);
    let added = 0;
    try {
      for (const file of unique) {
        setMessage(`Uploading gallery image ${added + 1} of ${unique.length}…`);
        const response = await fetch("/admin/api/media", { method: "POST", body: file });
        const result = await response.json(); if (!response.ok) throw new UserFacingError(result.error);
        gallery.push({ src: result.image, alt: "", caption: "" }); added++;
        patch({ gallery: [...gallery] });
      }
      setMessage(`${added} gallery images uploaded. Save your post to keep them.`);
    } catch (error) { setMessage(userError(error, `Upload stopped. ${added} uploaded images are kept in your edits; save them, then retry the remaining files.`), "error"); }
    finally { setBusy(false); }
  }

  return <main onBlurCapture={onBlurCapture} className="mx-auto max-w-6xl px-5 py-10">
    {confirmationModal}
    <h1 className="font-display text-3xl font-semibold">Updates & blog</h1>
    <p className="mt-2 text-ink-soft">Share upcoming arrivals and articles. Drafts are private. Prices are not managed here.</p>
    <AdminSaveBar label={current ? current.published ? "Save changes" : "Save draft" : "Save posts"} onSave={() => save()} disabled={!loaded || !dirty} busy={busy} dirty={dirty} tone={tone} message={message}><button className="btn-outline min-h-11" disabled={busy} onClick={reload}>Reload</button>
      {current ? <button type="button" className="btn-outline min-h-11" disabled={busy || !loaded} onClick={async () => {
        if (current.published && !await confirm({ title: "Unpublish this post?", message: "It will be hidden from the website, not deleted. This also saves your current post edits.", action: "Unpublish post" })) return;
        await save(!current.published);
      }}>{current.published ? "Unpublish post" : "Publish post"}</button> : null}
    </AdminSaveBar>
    <p className="mt-3 text-sm text-steel">Saving keeps each post’s current publication status. These actions save all pending post edits.</p>
    <FormProblems problems={attempted ? allProblems : []} onSelect={selectProblem} />
    <fieldset disabled={busy || !loaded} className="mt-6 grid min-w-0 gap-8 disabled:opacity-60 md:grid-cols-[260px_minmax(0,1fr)]">
      <div className="min-w-0 space-y-4">
        <button className="btn-outline" type="button" disabled={posts.length >= 100} onClick={add}>Add post</button>
        <PublicationFilter value={status} onChange={setStatus} />
        <label className="block text-sm">Search posts<input className={input} type="search" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        <div className="max-h-[60vh] space-y-2 overflow-y-auto">
          {posts.filter((post) => matchesPublication(post.published, status) && `${post.title} ${post.kind}`.toLowerCase().includes(query.toLowerCase())).map((post) => <button type="button" key={post.id} aria-pressed={selected === post.id} onClick={() => { setSelected(post.id); setPreview(false); setPublishTarget(null); }} className="block w-full rounded-lg border border-hair p-3 text-left text-sm break-words aria-pressed:border-navy aria-pressed:bg-navy-tint"><span className="block font-medium">{post.title}</span><span className="mt-1 block text-xs text-steel">{post.kind} · {post.published ? "Published" : "Draft"}</span></button>)}
        </div>
        {!posts.length ? <p className="text-sm text-steel">No posts yet. Add your first announcement or article.</p> : null}
        {posts.length > 0 && !posts.some((post) => matchesPublication(post.published, status) && `${post.title} ${post.kind}`.toLowerCase().includes(query.toLowerCase())) ? <p className="text-sm text-steel">No posts match. Choose All or clear your search to see more posts.</p> : null}
      </div>
      {current ? <div className="min-w-0 space-y-5">
        <p className="text-sm font-medium">{current.published ? "Published · visible on the website" : "Draft · only visible to admins"}</p>
        <LinkedInSharePanel key={`${current.id}-${dirty}-${current.published}`} post={current} dirty={dirty} previewMode={previewMode} />
        <div className="flex flex-wrap gap-3"><button type="button" className="btn-outline" onClick={() => setPreview(!preview)}>{preview ? "Edit post" : "Preview post"}</button><button type="button" className="btn-ghost" onClick={async () => { if (await confirm({ title: "Remove this post?", message: `Remove “${current.title}”? Save posts to apply the deletion.`, action: "Remove post" })) { resetFields(); setAttempted(false); setPosts((items) => items.filter((post) => post.id !== selected)); setSelected(""); } }}>Remove post</button></div>
        {preview ? <article className="space-y-5 break-words"><p className="text-sm text-steel">Preview · {current.kind} · {current.date}</p><h2 className="font-display text-3xl">{current.title}</h2>{current.image ? <ImagePlaceholder src={`/admin/api/media?id=${current.image.split("/").pop()}`} label={current.title} /> : null}<p className="text-lg">{postSummary(current)}</p><PostBody body={current.body} /><PostGallery images={current.gallery} title={current.title} preview /></article> : <>
          <label className="block text-sm">Title <span className="text-xs text-steel">Required</span><input aria-required="true" aria-label="Title" {...fieldProblemProps(problems, fieldPath("title"))} className={input} maxLength={200} value={current.title} onChange={(event) => patch({ title: event.target.value })} /><FieldProblem problems={problems} path={fieldPath("title")} /></label>
          <div className="rounded-lg bg-navy-tint p-3 text-sm"><span className="font-medium">Website address</span><p className="mt-1 break-all text-ink-soft">/blog/{current.slug}</p><p className="mt-2 text-xs text-steel">Generated from the title. Once saved, this address stays the same so shared links keep working.</p></div>
          <label className="block text-sm">Body <span className="text-xs text-steel">Required before publishing</span><textarea aria-required={current.published || publishTarget === current.id} aria-label="Body" {...fieldProblemProps(problems, fieldPath("body"))} className={input} rows={12} maxLength={10000} value={current.body} onChange={(event) => patch({ body: event.target.value })} /><span className="mt-1 block text-xs text-steel">Leave a blank line between paragraphs. Use ## Heading for a section, ### Heading for a subsection, and - for each bullet. Separate sections with blank lines. HTML is never executed.</span><FieldProblem problems={problems} path={fieldPath("body")} /></label>
          <details key={current.id}><summary className="min-h-11 cursor-pointer py-3 font-medium">Additional details (optional)</summary><div className="space-y-5 pt-3">
          <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm">Post type<select aria-label="Post type" {...fieldProblemProps(problems, fieldPath("kind"))} className={input} value={current.kind} onChange={(event) => patch({ kind: event.target.value as CmsPost["kind"] })}>{postKinds.map((kind) => <option key={kind}>{kind}</option>)}</select><FieldProblem problems={problems} path={fieldPath("kind")} /></label><label className="block text-sm">Display date<input aria-label="Display date" {...fieldProblemProps(problems, fieldPath("date"))} className={input} type="date" value={current.date} onChange={(event) => patch({ date: event.target.value })} /><FieldProblem problems={problems} path={fieldPath("date")} /></label></div>
          <label className="block text-sm">Author<input aria-label="Author" {...fieldProblemProps(problems, fieldPath("author"))} className={input} maxLength={100} value={current.author} onChange={(event) => patch({ author: event.target.value })} /><FieldProblem problems={problems} path={fieldPath("author")} /></label>
          {current.kind !== "Blog" ? <section aria-label="Arrival notice" className="space-y-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
            <h3 className="font-semibold text-navy">Arrival notice</h3>
            <label className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" checked={current.arrivalNoticeEnabled !== false} onChange={event => patch({ arrivalNoticeEnabled: event.target.checked })} />Highlight this arrival on the website</label>
            {current.arrivalNoticeEnabled !== false ? <>
              <label className="block text-sm">Highlight until (optional)<input aria-label="Highlight until" type="date" min={current.date} value={current.arrivalNoticeUntil ?? ""} {...fieldProblemProps(problems, fieldPath("arrivalNoticeUntil"))} onChange={event => patch({ arrivalNoticeUntil: event.target.value })} className={input} /><FieldProblem problems={problems} path={fieldPath("arrivalNoticeUntil")} /></label>
              <p className="text-sm text-ink-soft">Leave blank for 90 days from the display date. Highlight ends after {arrivalNoticeEnd(current) || "a valid display date"} (Addis Ababa time).</p>
              <p className="text-sm font-medium text-navy">{hasArrivalNotice(current) ? "Highlight active for this date range." : "Highlight is outside its date range."} Draft posts remain private.</p>
            </> : null}
            <p className="text-xs leading-relaxed text-ink-soft">After expiry, the post stays published as an “Arrival update” without the animated notice. Use “New arrival” only when equipment has arrived; “Upcoming arrival” means it is still expected.</p>
          </section> : null}
          <label className="block text-sm">Custom summary (optional)<span className="mt-1 block text-xs text-steel">Leave blank to use a short introduction from the article.</span><textarea aria-label="Summary" {...fieldProblemProps(problems, fieldPath("excerpt"))} className={input} rows={3} maxLength={500} value={current.excerpt} onChange={(event) => patch({ excerpt: event.target.value })} /><FieldProblem problems={problems} path={fieldPath("excerpt")} /></label>
          <label className="block text-sm">Cover image (JPEG, PNG or WebP, up to 8 MB, resized automatically)<input key={current.id} className={input} type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { void upload(event.target.files?.[0]); event.target.value = ""; }} /></label>
          {current.image ? <div><ImagePlaceholder src={`/admin/api/media?id=${current.image.split("/").pop()}`} label={current.title} className="max-h-64" /><button type="button" className="btn-ghost mt-2" onClick={() => patch({ image: "" })}>Remove image</button></div> : null}
          <section aria-label="Gallery images" className="space-y-4 border-t border-hair pt-5">
            <h2 className="font-display text-xl font-semibold text-navy">Article gallery</h2>
            <p className="text-sm text-ink-soft">Extra pictures appear inside the article. The cover above stays on the homepage and blog cards. Up to 8 images, 3 MB each.</p>
            <label className="block text-sm">Add gallery images<input className={input} type="file" multiple accept="image/jpeg,image/png,image/webp" disabled={(current.gallery?.length ?? 0) >= 8} onChange={event => { void uploadGallery(Array.from(event.target.files ?? [])); event.target.value = ""; }} /></label>
            {(current.gallery ?? []).map((image, index) => <div key={image.src} className="space-y-3 rounded-xl border border-hair p-4">
              <p className="text-sm font-medium">Image {index + 1}</p>
              <ImagePlaceholder src={`/admin/api/media?id=${image.src.split("/").pop()}`} label={image.alt || `Gallery image ${index + 1}`} className="max-h-48" />
              <label className="block text-sm">Image description {index + 1}<input className={input} maxLength={200} value={image.alt} onChange={event => patch({ gallery: current.gallery?.map((item, i) => i === index ? { ...item, alt: event.target.value } : item) })} /><span className="text-xs text-steel">Describe the picture for people using screen readers.</span></label>
              <label className="block text-sm">Caption {index + 1}<input className={input} maxLength={300} value={image.caption} onChange={event => patch({ gallery: current.gallery?.map((item, i) => i === index ? { ...item, caption: event.target.value } : item) })} /></label>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="btn-outline min-h-11" disabled={index === 0} aria-label={`Move image ${index + 1} earlier`} onClick={() => { const gallery = [...(current.gallery ?? [])]; [gallery[index - 1], gallery[index]] = [gallery[index], gallery[index - 1]]; patch({ gallery }); }}>Move earlier</button>
                <button type="button" className="btn-ghost min-h-11" aria-label={`Remove gallery image ${index + 1}`} onClick={() => patch({ gallery: current.gallery?.filter((_, i) => i !== index) })}>Remove</button>
              </div>
            </div>)}
          </section>
          <p className="text-xs text-steel">The display date is not a publishing schedule. Choose Publish post when it is ready.</p>
          </div></details>
        </>}
      </div> : <p className="text-ink-soft">Choose a post or create a new one.</p>}
    </fieldset>
  </main>;
}
