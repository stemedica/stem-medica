"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { control, TextField, TextareaField, SelectField, CheckboxField, FileField, Panel, StatusPill, EmptyState } from "../ui";
import { downscaleForUpload } from "@/lib/client-image";
import { PublicationFilter, matchesPublication, type PublicationStatus } from "@/components/PublicationFilter";
import { postSlug, postSummary } from "@/lib/post-slug";
import { PostBody } from "@/components/PostBody";
import { useFieldValidation } from "@/components/useFieldValidation";
import { useAdminFeedback } from "@/components/useAdminFeedback";
import { AdminSaveBar } from "@/components/AdminSaveBar";
import { formProblems, type FormProblem, UserFacingError, userError } from "@/lib/form-errors";
import { FormProblems, focusProblem } from "@/components/FormProblems";
import { postKinds, postsSchema, type CmsPost } from "@/lib/post-schema";
import { PostGallery } from "@/components/PostGallery";
import { arrivalNoticeEnd, hasArrivalNotice } from "@/lib/arrival-notice";
import { LinkedInSharePanel } from "@/components/LinkedInSharePanel";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { useConfirmation, useUnsavedChanges } from "@/components/ConfirmationModal";

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
  const matching = posts.filter((post) =>
    matchesPublication(post.published, status)
    && `${post.title} ${post.kind}`.toLowerCase().includes(query.toLowerCase()));
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
    setPosts((items) => [...items, { id, slug: postSlug("New post", items.map((item) => item.slug)), title: "New post", date: new Date().toISOString().slice(0, 10), kind: "Blog", place: "", excerpt: "", author: "STEM MEDICA", body: "", image: "", published: false }]);
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
    if (file.size > 10_000_000) { setMessage("Choose an image under 10 MB.", "error"); return; }
    setBusy(true); setMessage("Uploading image…");
    try {
      const body = await downscaleForUpload(file);
      const response = await fetch("/admin/api/media", { method: "POST", body });
      const result = await response.json(); if (!response.ok) throw new UserFacingError(result.error);
      patch({ image: result.image }); setMessage("Image uploaded. Save posts to keep this change.");
    } catch (error) { setMessage(userError(error, "Upload failed."), "error"); }
    finally { setBusy(false); }
  }
  async function uploadGallery(files: File[]) {
    if (!current || busy || !files.length) return;
    const gallery = [...(current.gallery ?? [])];
    if (gallery.length + files.length > 8) { setMessage("You can add up to 8 gallery images. Choose fewer files.", "error"); return; }
    if (files.some(file => file.size > 10_000_000 || !/^image\//.test(file.type))) { setMessage("Choose image files under 10 MB each.", "error"); return; }
    const unique = files.filter((file, i) => files.findIndex(other => other.name === file.name && other.size === file.size && other.lastModified === file.lastModified) === i);
    setBusy(true);
    let added = 0;
    try {
      for (const file of unique) {
        setMessage(`Uploading gallery image ${added + 1} of ${unique.length}…`);
        const body = await downscaleForUpload(file);
        const response = await fetch("/admin/api/media", { method: "POST", body });
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
      <div className="min-w-0">
        <button className={`${"btn-outline"} min-h-11 w-full`} type="button" disabled={posts.length >= 60} onClick={add}>Add post</button>

        <label className="mt-3 block">
          <span className="sr-only">Search posts</span>
          <input className={control} type="search" placeholder="Search posts…" value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>

        <div className="mt-3"><PublicationFilter value={status} onChange={setStatus} /></div>

        <div className="mt-3 max-h-[60vh] min-w-0 overflow-y-auto overscroll-contain rounded-xl border border-hair bg-white">
          {matching.length ? matching.map((post) => (
            <button type="button" key={post.id} aria-current={selected === post.id ? "true" : undefined}
              onClick={() => { setSelected(post.id); setPreview(false); setPublishTarget(null); }}
              className={`block w-full border-b border-hair px-4 py-3 text-left last:border-0 transition-colors ${selected === post.id ? "bg-navy-tint" : "hover:bg-paper"}`}>
              <span className={`block truncate text-sm ${selected === post.id ? "font-semibold text-navy" : "text-ink"}`}>{post.title || "Untitled"}</span>
              <span className="mt-1 flex flex-wrap items-center gap-2">
                <StatusPill published={post.published} />
                <span className="truncate text-xs text-steel">{post.kind} · {post.date}</span>
              </span>
            </button>
          )) : (
            <p className="px-4 py-8 text-center text-sm text-steel">
              {posts.length ? "No posts match. Clear the search or choose All." : "No posts yet."}
            </p>
          )}
        </div>
      </div>
      {current ? <div className="min-w-0 space-y-5">
        <p className="text-sm font-medium">{current.published ? "Published · visible on the website" : "Draft · only visible to admins"}</p>
        <LinkedInSharePanel key={`${current.id}-${dirty}-${current.published}`} post={current} dirty={dirty} previewMode={previewMode} />
        <div className="flex flex-wrap gap-3"><button type="button" className="btn-outline" onClick={() => setPreview(!preview)}>{preview ? "Edit post" : "Preview post"}</button><button type="button" className="btn-ghost" onClick={async () => { if (await confirm({ title: "Remove this post?", message: `Remove “${current.title}”? Save posts to apply the deletion.`, action: "Remove post" })) { resetFields(); setAttempted(false); setPosts((items) => items.filter((post) => post.id !== selected)); setSelected(""); } }}>Remove post</button></div>
        {preview ? <article className="space-y-5 break-words"><p className="text-sm text-steel">Preview · {current.kind} · {current.date}</p><h2 className="font-display text-3xl">{current.title}</h2>{current.image ? <ImagePlaceholder src={`/admin/api/media?id=${current.image.split("/").pop()}`} label={current.title} /> : null}<p className="text-lg">{postSummary(current)}</p><PostBody body={current.body} /><PostGallery images={current.gallery} title={current.title} preview /></article> : <>
          <Panel title="Article" description={<>Website address: <span className="break-all font-medium text-ink">/blog/{current.slug}</span>. Generated from the title; once saved it never changes, so shared links keep working.</>}>
            <div className="space-y-4">
              <TextField required label="Title" path={fieldPath("title")} problems={problems} maxLength={200}
                value={current.title} onChange={(title) => patch({ title })} />
              <TextareaField label="Body" required path={fieldPath("body")} problems={problems} rows={14} maxLength={10000}
                value={current.body} onChange={(body) => patch({ body })}
                hint="Required before publishing"
                note={<>Leave a blank line between paragraphs. <code className="rounded bg-paper-2 px-1 py-0.5 font-mono text-[11px]">## Heading</code> for a section, <code className="rounded bg-paper-2 px-1 py-0.5 font-mono text-[11px]">###</code> for a subsection, <code className="rounded bg-paper-2 px-1 py-0.5 font-mono text-[11px]">-</code> for each bullet. HTML is never executed.</>} />
            </div>
          </Panel>

          <Panel title="Publishing" description="How the post is labelled and dated on the website.">
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField label="Post type" path={fieldPath("kind")} problems={problems}
                value={current.kind} onChange={(kind) => patch({ kind: kind as CmsPost["kind"] })}>
                {postKinds.map((kind) => <option key={kind}>{kind}</option>)}
              </SelectField>
              <TextField label="Display date" type="date" path={fieldPath("date")} problems={problems}
                value={current.date} onChange={(date) => patch({ date })}
                hint="Not a schedule" />
              <TextField label="Author" path={fieldPath("author")} problems={problems} maxLength={100}
                value={current.author} onChange={(author) => patch({ author })} className="sm:col-span-2" />
            </div>
          </Panel>

          {current.kind === "Upcoming arrival" || current.kind === "New arrival" ? (
            <Panel tone="accent" title="Arrival notice"
              description={<>Use “New arrival” only once equipment has landed; “Upcoming arrival” means it is still expected. After expiry the post stays published as an “Arrival update” without the highlight.</>}>
              <div className="space-y-4">
                <CheckboxField label="Highlight this arrival on the website"
                  checked={current.arrivalNoticeEnabled !== false}
                  onChange={(arrivalNoticeEnabled) => patch({ arrivalNoticeEnabled })} />
                {current.arrivalNoticeEnabled !== false ? <>
                  <TextField label="Highlight until" type="date" path={fieldPath("arrivalNoticeUntil")} problems={problems}
                    value={current.arrivalNoticeUntil ?? ""} onChange={(arrivalNoticeUntil) => patch({ arrivalNoticeUntil })}
                    hint="Optional — 90 days by default" />
                  <p className="text-sm leading-relaxed text-ink-soft">
                    Highlight ends after {arrivalNoticeEnd(current) || "a valid display date"} (Addis Ababa time).{" "}
                    <span className="font-medium text-navy">{hasArrivalNotice(current) ? "Active now." : "Outside its date range."}</span>{" "}
                    Draft posts stay private either way.
                  </p>
                </> : null}
              </div>
            </Panel>
          ) : null}

          {current.kind === "Achievement" ? (
            <Panel tone="accent" title="Facility & location"
              description="The hospital, clinic or centre where this work took place. Appears on the homepage achievement card.">
              <TextField label="Facility / Location" maxLength={120} path={fieldPath("place")} problems={problems}
                value={current.place ?? ""} onChange={(place) => patch({ place })}
                placeholder="e.g. St. Paul’s Hospital Millennium Medical College, Addis Ababa" />
            </Panel>
          ) : null}

          <Panel title="Summary" description="Shown on cards and in search results. Leave blank to use the opening of the article.">
            <TextareaField label="Custom summary" path={fieldPath("excerpt")} problems={problems} rows={3} maxLength={500}
              value={current.excerpt} onChange={(excerpt) => patch({ excerpt })} />
          </Panel>

          <Panel title="Cover image" description="Appears on the homepage and blog cards. A post without one simply shows no image.">
            <FileField label="Upload a cover" accept="image/jpeg,image/png,image/webp" inputKey={current.id}
              disabled={busy}
              onFiles={(files) => upload(files[0])} />
            {current.image ? <div className="mt-4">
              <ImagePlaceholder src={`/admin/api/media?id=${current.image.split("/").pop()}`} label={current.title} className="max-h-64" />
              <button type="button" className="btn-ghost mt-3 min-h-11" onClick={() => patch({ image: "" })}>Remove cover</button>
            </div> : null}
          </Panel>

          <Panel title="Article gallery"
            description="Extra pictures shown inside the article. Up to 8."
            actions={<span className="text-xs text-steel">{current.gallery?.length ?? 0} of 8</span>}>
            <FileField label="Add gallery images" accept="image/jpeg,image/png,image/webp" multiple
              disabled={(current.gallery?.length ?? 0) >= 8 || busy}
              onFiles={(files) => uploadGallery(files)} />
            {(current.gallery ?? []).length ? <ul className="mt-4 space-y-3">
              {(current.gallery ?? []).map((image, index) => (
                <li key={image.src} className="rounded-xl border border-hair p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-ink">Image {index + 1}</p>
                    <div className="flex gap-2">
                      <button type="button" className="btn-outline min-h-11" disabled={index === 0} aria-label={`Move image ${index + 1} earlier`}
                        onClick={() => { const gallery = [...(current.gallery ?? [])]; [gallery[index - 1], gallery[index]] = [gallery[index], gallery[index - 1]]; patch({ gallery }); }}>Move up</button>
                      <button type="button" className="btn-ghost min-h-11" aria-label={`Remove gallery image ${index + 1}`}
                        onClick={() => patch({ gallery: current.gallery?.filter((_, i) => i !== index) })}>Remove</button>
                    </div>
                  </div>
                  <ImagePlaceholder src={`/admin/api/media?id=${image.src.split("/").pop()}`} label={image.alt || `Gallery image ${index + 1}`} className="mt-3 max-h-48" />
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <TextField label={`Image description ${index + 1}`} maxLength={200} value={image.alt}
                      hint="For screen readers"
                      onChange={(alt) => patch({ gallery: current.gallery?.map((item, i) => i === index ? { ...item, alt } : item) })} />
                    <TextField label={`Caption ${index + 1}`} maxLength={300} value={image.caption}
                      onChange={(caption) => patch({ gallery: current.gallery?.map((item, i) => i === index ? { ...item, caption } : item) })} />
                  </div>
                </li>
              ))}
            </ul> : null}
          </Panel>
        </>}
      </div> : (
        <EmptyState
          title={posts.length ? "No post selected" : "No posts yet"}
          message={posts.length ? "Choose a post from the list to edit it." : "Share an upcoming arrival, a new arrival, or an article."}
          action={<button type="button" className="btn-outline min-h-11" onClick={add}>Add post</button>}
        />
      )}
    </fieldset>
  </main>;
}
