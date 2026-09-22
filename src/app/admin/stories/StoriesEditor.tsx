"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { TextField, TextareaField, CheckboxField, FileField, Panel, StatusPill, EmptyState } from "../ui";
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

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-5 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy">Achievements</h1>
          <p className="mt-1.5 max-w-[60ch] text-sm leading-relaxed text-ink-soft">
            Work you have carried out, shown on the homepage as a row people can scroll. Name the facility and the town in <strong>Where</strong>, and what you supplied or installed in <strong>What you did</strong>.
          </p>
        </div>
        <button type="button" onClick={add} className="btn-primary min-h-11">Add achievement</button>
      </header>

      <FormProblems problems={attempted ? problems : []} onSelect={(problem) => focusProblem(problem.path)} />

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <section aria-label="All achievements" className="space-y-2">
          {!loaded && busy ? <p className="text-sm text-steel">Loading…</p> : null}
          {loaded && !stories.length ? (
            <EmptyState
              title="No achievements yet"
              message="Add your first one. Until something is published here, the homepage shows a short description of the work you do instead."
            />
          ) : null}
          {stories.map((story, position) => (
            <div key={story.id} className={`rounded-xl border p-3 transition-colors ${story.id === selected ? "border-navy bg-navy-tint" : "border-hair bg-white hover:border-navy/40"}`}>
              <button type="button" onClick={() => setSelected(story.id)} className="block w-full text-left">
                <span className="block truncate font-medium text-navy">{story.title || "Untitled achievement"}</span>
                <span className="mt-0.5 block truncate text-xs text-steel">{story.place || "No location yet"}</span>
                <span className="mt-2 inline-flex"><StatusPill published={story.published} /></span>
              </button>
              <div className="mt-2 flex gap-1 border-t border-hair pt-2">
                <button type="button" onClick={() => move(position, position - 1)} disabled={position === 0} aria-label={`Move ${story.title || "achievement"} earlier`} className="flex size-9 items-center justify-center rounded-lg text-steel hover:bg-white hover:text-navy disabled:opacity-30"><ArrowUp size={16} aria-hidden="true" /></button>
                <button type="button" onClick={() => move(position, position + 1)} disabled={position === stories.length - 1} aria-label={`Move ${story.title || "achievement"} later`} className="flex size-9 items-center justify-center rounded-lg text-steel hover:bg-white hover:text-navy disabled:opacity-30"><ArrowDown size={16} aria-hidden="true" /></button>
                <button type="button" onClick={() => remove(story)} aria-label={`Delete ${story.title || "achievement"}`} className="ml-auto flex size-9 items-center justify-center rounded-lg text-steel hover:bg-white hover:text-scarlet"><Trash2 size={16} aria-hidden="true" /></button>
              </div>
            </div>
          ))}
        </section>

        <section aria-label="Achievement details" className="min-w-0 space-y-5">
          {current ? (
            <>
              <Panel title="What you did">
                <TextField
                  label="Title" required value={current.title}
                  onChange={(value) => update(current.id, { title: value })}
                  path={`${index}.title`} problems={attempted ? problems : []}
                  hint="For example: Equipping a new intensive care unit."
                />
                <TextField
                  label="Where" required value={current.place}
                  onChange={(value) => update(current.id, { place: value })}
                  path={`${index}.place`} problems={attempted ? problems : []}
                  hint="The facility and town, or the kind of facility."
                />
                <TextareaField
                  label="Description" value={current.summary} rows={5}
                  onChange={(value) => update(current.id, { summary: value })}
                  path={`${index}.summary`} problems={attempted ? problems : []}
                  hint="What was supplied, installed or supported. A few sentences."
                />
              </Panel>

              <Panel title="Photo">
                <ImagePlaceholder
                  src={current.image ? `/admin/api/media?id=${current.image.split("/").pop()}` : ""}
                  label={current.title || "Achievement photo"}
                  ratio="5/3"
                />
                <FileField
                  label={current.image ? "Replace photo" : "Add photo"}
                  accept="image/*"
                  onFiles={(files) => pickImage(files[0] ?? null, current.id)}
                  hint="Optional. Without one the card shows a marked placeholder."
                />
                {current.image ? (
                  <button type="button" onClick={() => update(current.id, { image: "" })} className="btn-outline min-h-11">Remove photo</button>
                ) : null}
              </Panel>

              <Panel title="Publishing">
                <CheckboxField
                  checked={current.published}
                  onChange={(checked) => update(current.id, { published: checked })}
                  label="Show on the homepage"
                  hint="Unpublished achievements stay here and are not shown to visitors."
                />
              </Panel>
            </>
          ) : loaded ? (
            <EmptyState title="Nothing selected" message="Choose an achievement on the left, or add a new one." />
          ) : null}
        </section>
      </div>

      <AdminSaveBar
        label="Save achievements"
        onSave={save}
        disabled={!loaded}
        busy={busy}
        dirty={dirty}
        message={message}
        tone={tone}
      />
      {confirmationModal}
    </main>
  );
}
