"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { control, TextField, TextareaField, CheckboxField, FileField, Panel, StatusPill, EmptyState } from "../ui";
import { downscaleForUpload } from "@/lib/client-image";
import { useAdminFeedback } from "@/components/useAdminFeedback";
import { AdminSaveBar } from "@/components/AdminSaveBar";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { useConfirmation, useUnsavedChanges } from "@/components/ConfirmationModal";
import { formProblems, type FormProblem, UserFacingError, userError } from "@/lib/form-errors";
import { FormProblems, focusProblem } from "@/components/FormProblems";
import { blankStory, storiesSchema, type CmsStory } from "@/lib/story-schema";

type Snapshot = { stories: CmsStory[]; etag: string | null };

async function fetchStories(): Promise<Snapshot> {
  const response = await fetch("/admin/api/stories", { cache: "no-store" });
  const body = await response.json();
  if (!response.ok) throw new UserFacingError(body.error);
  return { stories: storiesSchema.parse(body.stories), etag: body.etag };
}

export function StoriesEditor() {
  const saving = useRef(false);
  const { confirm, confirmationModal } = useConfirmation();
  const { message, tone, setMessage } = useAdminFeedback("Loading achievements…");
  const [stories, setStories] = useState<CmsStory[]>([]);
  const [etag, setEtag] = useState<string | null>(null);
  const [saved, setSaved] = useState("[]");
  const [selected, setSelected] = useState("");
  const [busy, setBusy] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [query, setQuery] = useState("");

  const serialized = useMemo(() => JSON.stringify(stories), [stories]);
  const dirty = saved !== serialized;
  const current = stories.find((story) => story.id === selected);
  const index = stories.findIndex((story) => story.id === selected);

  const validation = useMemo(() => storiesSchema.safeParse(stories), [stories]);
  const problems: FormProblem[] = validation.success ? [] : formProblems(validation.error.issues);

  const accept = useCallback((snapshot: Snapshot) => {
    setStories(snapshot.stories); setEtag(snapshot.etag);
    setSaved(JSON.stringify(snapshot.stories));
    setSelected(snapshot.stories[0]?.id ?? ""); setLoaded(true); setAttempted(false);
    setMessage("Achievements loaded.");
  }, [setMessage]);

  useEffect(() => {
    let active = true;
    fetchStories()
      .then((snapshot) => { if (active) accept(snapshot); })
      .catch(() => { if (active) setMessage("Unable to load achievements. Use Reload to retry.", "error"); })
      .finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, [accept, setMessage]);

  useUnsavedChanges(dirty, confirm);

  /** Discard local edits and take the stored document again. */
  async function reload() {
    setBusy(true);
    try { accept(await fetchStories()); }
    catch { setMessage("Unable to reload achievements. Check your connection and try again.", "error"); }
    finally { setBusy(false); }
  }

  function update(id: string, patch: Partial<CmsStory>) {
    setStories((list) => list.map((story) => story.id === id ? { ...story, ...patch } : story));
  }

  function add() {
    const story = blankStory();
    setStories((list) => [...list, story]);
    setSelected(story.id);
    setMessage("New achievement added. It stays hidden until you publish it.");
  }

  async function remove(story: CmsStory) {
    const ok = await confirm({
      title: "Delete this achievement?",
      message: `“${story.title || "Untitled"}” will be removed from the homepage when you save.`,
      action: "Delete",
    });
    if (!ok) return;
    setStories((list) => list.filter((item) => item.id !== story.id));
    setSelected((was) => was === story.id ? "" : was);
  }

  /** Order on the homepage is the order here, so it has to be changeable. */
  function move(from: number, to: number) {
    if (to < 0 || to >= stories.length) return;
    setStories((list) => {
      const next = [...list];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }

  async function pickImage(file: File | null, id: string) {
    if (!file) return;
    setBusy(true);
    try {
      const body = await downscaleForUpload(file);
      const response = await fetch("/admin/api/media", { method: "POST", body });
      const result = await response.json();
      if (!response.ok) throw new UserFacingError(result.error);
      update(id, { image: result.path });
      setMessage("Photo added. Save to publish it.");
    } catch (error) {
      setMessage(userError(error, "That image could not be uploaded. Try another file."), "error");
    } finally { setBusy(false); }
  }

  async function save() {
    if (saving.current) return;
    setAttempted(true);
    if (!validation.success) {
      setMessage("Check the highlighted fields before saving.", "error");
      focusProblem(problems[0]?.path ?? "");
      return;
    }
    saving.current = true; setBusy(true);
    try {
      const response = await fetch("/admin/api/stories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stories, etag }),
      });
      const body = await response.json();
      if (!response.ok) throw new UserFacingError(body.error);
      setEtag(body.etag); setSaved(JSON.stringify(stories)); setAttempted(false);
      setMessage("Achievements saved.", "success");
    } catch (error) {
      setMessage(userError(error), "error");
    } finally { saving.current = false; setBusy(false); }
  }

  const matching = stories.filter((story) =>
    `${story.title} ${story.place}`.toLowerCase().includes(query.toLowerCase()));

  return <main className="mx-auto max-w-6xl px-5 py-10">
    {confirmationModal}
    <h1 className="font-display text-3xl font-semibold">Achievements</h1>
    <p className="mt-2 text-ink-soft">Work you have carried out, shown on the homepage as a row people can scroll. Drafts are private.</p>

    <AdminSaveBar
      label={current ? current.published ? "Save changes" : "Save draft" : "Save achievements"}
      onSave={() => save()} disabled={!loaded || !dirty} busy={busy} dirty={dirty} tone={tone} message={message}
    >
      <button className="btn-outline min-h-11" disabled={busy} onClick={reload}>Reload</button>
      {current ? <button type="button" className="btn-outline min-h-11" disabled={busy || !loaded} onClick={async () => {
        if (current.published && !await confirm({ title: "Unpublish this achievement?", message: "It will be hidden from the homepage, not deleted. This also saves your current edits.", action: "Unpublish" })) return;
        update(current.id, { published: !current.published });
      }}>{current.published ? "Unpublish" : "Publish"}</button> : null}
    </AdminSaveBar>
    <p className="mt-3 text-sm text-steel">Saving keeps each achievement’s current publication status. These actions save all pending edits.</p>

    <FormProblems problems={attempted ? problems : []} onSelect={(problem) => focusProblem(problem.path)} />

    <fieldset disabled={busy || !loaded} className="mt-6 grid min-w-0 gap-8 disabled:opacity-60 md:grid-cols-[260px_minmax(0,1fr)]">
      <div className="min-w-0">
        <button className="btn-outline min-h-11 w-full" type="button" disabled={stories.length >= 60} onClick={add}>Add achievement</button>

        <label className="mt-3 block">
          <span className="sr-only">Search achievements</span>
          <input className={control} type="search" placeholder="Search achievements…" value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>

        <div className="mt-3 max-h-[60vh] min-w-0 overflow-y-auto overscroll-contain rounded-xl border border-hair bg-white">
          {matching.length ? matching.map((story) => (
            <button type="button" key={story.id} aria-current={selected === story.id ? "true" : undefined}
              onClick={() => setSelected(story.id)}
              className={`block w-full border-b border-hair px-4 py-3 text-left last:border-0 transition-colors ${selected === story.id ? "bg-navy-tint" : "hover:bg-paper"}`}>
              <span className={`block truncate text-sm ${selected === story.id ? "font-semibold text-navy" : "text-ink"}`}>{story.title || "Untitled"}</span>
              <span className="mt-1 flex flex-wrap items-center gap-2">
                <StatusPill published={story.published} />
                <span className="truncate text-xs text-steel">{story.place || "No location yet"}</span>
              </span>
            </button>
          )) : (
            <p className="px-4 py-8 text-center text-sm text-steel">
              {stories.length ? "No achievement matches that search." : "No achievements yet. Add your first one."}
            </p>
          )}
        </div>
      </div>

      <div className="min-w-0 space-y-5">
        {current ? <>
          <Panel title="What you did">
            <TextField label="Title" required value={current.title}
              onChange={(value) => update(current.id, { title: value })}
              path={`${index}.title`} problems={attempted ? problems : []}
              hint="For example: Equipping a new intensive care unit." />
            <TextField label="Where" required value={current.place}
              onChange={(value) => update(current.id, { place: value })}
              path={`${index}.place`} problems={attempted ? problems : []}
              hint="The facility and town, or the kind of facility." />
            <TextareaField label="Description" value={current.summary} rows={5}
              onChange={(value) => update(current.id, { summary: value })}
              path={`${index}.summary`} problems={attempted ? problems : []}
              hint="What was supplied, installed or supported. A few sentences." />
          </Panel>

          <Panel title="Photo">
            <ImagePlaceholder
              src={current.image ? `/admin/api/media?id=${current.image.split("/").pop()}` : ""}
              label={current.title || "Achievement photo"} ratio="5/3" />
            <FileField label={current.image ? "Replace photo" : "Add photo"} accept="image/*"
              onFiles={(files) => pickImage(files[0] ?? null, current.id)}
              hint="Optional. Without one the card shows a marked placeholder." />
            {current.image ? <button type="button" onClick={() => update(current.id, { image: "" })} className="btn-outline min-h-11">Remove photo</button> : null}
          </Panel>

          <Panel title="Publishing">
            <CheckboxField checked={current.published}
              onChange={(checked) => update(current.id, { published: checked })}
              label="Show on the homepage"
              hint="Unpublished achievements stay here and are not shown to visitors." />
          </Panel>

          {/* Order decides the order of the homepage row, so it lives with the
              selected item rather than cluttering every row of the list. */}
          <Panel title="Order and removal">
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" className="btn-outline min-h-11" disabled={index <= 0} onClick={() => move(index, index - 1)}>
                <ArrowUp size={16} aria-hidden="true" /> Move earlier
              </button>
              <button type="button" className="btn-outline min-h-11" disabled={index >= stories.length - 1} onClick={() => move(index, index + 1)}>
                <ArrowDown size={16} aria-hidden="true" /> Move later
              </button>
              <span className="text-sm text-steel">Position {index + 1} of {stories.length}</span>
            </div>
            <button type="button" onClick={() => remove(current)} className="btn-outline min-h-11 text-scarlet">
              <Trash2 size={16} aria-hidden="true" /> Delete this achievement
            </button>
          </Panel>
        </> : loaded ? (
          <EmptyState title="Nothing selected" message="Choose an achievement on the left, or add a new one." />
        ) : null}
      </div>
    </fieldset>
  </main>;
}
