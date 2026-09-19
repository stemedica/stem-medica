"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { downscaleForUpload } from "@/lib/client-image";
import type { Catalogue, CmsProduct, CmsCategory } from "@/lib/cms-schema";
import { useConfirmation, useUnsavedChanges } from "@/components/ConfirmationModal";
import { PublicationFilter, matchesPublication, type PublicationStatus } from "@/components/PublicationFilter";
import { categorySlug } from "@/lib/category-slug";
import { useFieldValidation } from "@/components/useFieldValidation";
import { useAdminFeedback } from "@/components/useAdminFeedback";
import { AdminSaveBar } from "@/components/AdminSaveBar";
import { catalogueSchema } from "@/lib/cms-schema";
import { formProblems, type FormProblem, UserFacingError, userError } from "@/lib/form-errors";
import { FormProblems, FieldProblem, fieldProblemProps, focusProblem } from "@/components/FormProblems";
import { X } from "lucide-react";

const input = "mt-1 min-w-0 w-full rounded-lg border border-hair bg-white px-3 py-2 text-base";
const button = "min-h-11 min-w-11 rounded-lg border border-hair px-4 py-2 text-sm font-medium hover:border-navy disabled:cursor-not-allowed disabled:opacity-50";
const blankProduct = (category: string): CmsProduct => ({ slug: "", name: "", brand: "", origin: "", category, image: "", summary: "", availability: "On request", leadTime: "Confirm on enquiry", specs: [], services: [], featured: false, published: false });
const blankCategory = (): CmsCategory => ({ slug: "", name: "", short: "", blurb: "", image: "" });

export function CatalogueEditor() {
  const [attempted, setAttempted] = useState(false);
  const [focusTarget, setFocusTarget] = useState("");
  const { confirm, confirmationModal } = useConfirmation();
  const newProducts = useRef(new Set<string>());
  const saving = useRef(false);
  const [status, setStatus] = useState<PublicationStatus>("all");
  const newCategories = useRef(new Set<string>());
  const [data, setData] = useState<Catalogue | null>(null);
  const [etag, setEtag] = useState<string | null>(null);
  const [configured, setConfigured] = useState(false);
  const [mode, setMode] = useState<"products" | "categories">("products");
  const [selected, setSelected] = useState(0);
  const [busy, setBusy] = useState(true);
  const [dirty, setDirty] = useState(false);
  const { message, tone, setMessage } = useAdminFeedback("");
  const validation = useMemo(() => data ? validateCatalogue(data) : null, [data]);
  const allProblems = validation && !validation.success ? formProblems(validation.error.issues, "catalogue") : [];
  const { problems, onBlurCapture, resetFields } = useFieldValidation(allProblems, attempted);
  function selectProblem(problem: FormProblem) {
    const [section, index] = problem.path.split(".");
    if (section === "products" || section === "categories") { setMode(section); setStatus("all"); if (index !== undefined) setSelected(Number(index)); }
    setFocusTarget(problem.path); focusProblem(problem.path);
  }
  useEffect(() => { if (focusTarget) focusProblem(focusTarget); }, [focusTarget, mode, selected, attempted]);

  async function reload() {
    try {
      const response = await fetch("/admin/api/catalogue", { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new UserFacingError(body.error);
      resetFields(); setAttempted(false); setData(body.catalogue); setEtag(body.etag); setConfigured(body.configured); setDirty(false); setSelected(0); newCategories.current.clear(); newProducts.current.clear();
      setMessage(body.configured ? "Catalogue loaded." : "Storage is not connected. You can preview the editor, but saving needs a private Blob store.");
    } catch (e) { setMessage(userError(e, "Unable to load catalogue"), "error"); }
    finally { setBusy(false); }
  }
  useEffect(() => {
    let cancelled = false;
    fetch("/admin/api/catalogue", { cache: "no-store" }).then(async (response) => {
      const body = await response.json();
      if (!response.ok) throw new UserFacingError(body.error);
      if (cancelled) return;
      setData(body.catalogue); setEtag(body.etag); setConfigured(body.configured);
      setMessage(body.configured ? "Catalogue loaded." : "Connect a private Blob store to save changes.");
    }).catch((e) => { if (!cancelled) setMessage(userError(e, "Unable to load catalogue"), "error"); })
      .finally(() => { if (!cancelled) setBusy(false); });
    return () => { cancelled = true; };
  }, [setMessage]);
  useUnsavedChanges(dirty, confirm);

  function update(patch: Partial<CmsProduct & CmsCategory>) {
    if (!data) return;
    if (patch.specs && patch.specs.length !== data.products[selected]?.specs.length) { resetFields(); setAttempted(false); }
    // Only clone the edited record; preserve the rest of the catalogue by reference.
    const copy = { ...data, [mode]: data[mode].map((item, index) => index === selected ? { ...item } : item) } as Catalogue;
    const oldSlug = copy[mode][selected].slug;
    if (mode === "categories" && patch.name !== undefined && newCategories.current.has(oldSlug)) {
      patch = { ...patch, slug: categorySlug(patch.name, copy.categories.filter((_, i) => i !== selected).map((c) => c.slug)) };
      newCategories.current.delete(oldSlug); newCategories.current.add(patch.slug!);
    }
    if (mode === "products" && patch.name !== undefined && newProducts.current.has(oldSlug)) {
      patch = { ...patch, slug: categorySlug(patch.name || "New product", copy.products.filter((_, i) => i !== selected).map((p) => p.slug)) };
      newProducts.current.delete(oldSlug); newProducts.current.add(patch.slug!);
    }
    Object.assign(copy[mode][selected], patch);
    if (mode === "categories" && patch.slug !== undefined) copy.products = copy.products.map((p) => p.category === oldSlug ? { ...p, category: patch.slug! } : p);
    setData(copy); setDirty(true);
  }
  function add() {
    if (!data) return;
    const emptyIndex = data[mode].findIndex((item) => !item.name.trim() && ("brand" in item ? !item.brand.trim() && !item.origin.trim() && !item.summary.trim() : !item.short.trim() && !item.blurb.trim()));
    if (emptyIndex >= 0) { setSelected(emptyIndex); setMessage("You already have an empty item. Fill it in before adding another."); return; }
    if (data[mode].length >= (mode === "products" ? 500 : 100)) { setMessage("This list has reached its limit. Remove an unused item before adding another.", "warning"); return; }
    const copy = structuredClone(data);
    if (mode === "products") {
      const product = { ...blankProduct(""), slug: categorySlug("New product", copy.products.map((p) => p.slug)) };
      newProducts.current.add(product.slug); copy.products.push(product);
    }
    else {
      const category = { ...blankCategory(), slug: categorySlug("New category", copy.categories.map((c) => c.slug)) };
      newCategories.current.add(category.slug); copy.categories.push(category);
    }
    resetFields(); setAttempted(false);
    setStatus("all"); setSelected(copy[mode].length - 1); setData(copy); setDirty(true);
  }
  async function remove() {
    if (!data) return;
    const item = data[mode][selected];
    if (mode === "categories" && data.products.some((p) => p.category === item.slug)) { setMessage("Move this category’s products to another category before deleting it.", "warning"); return; }
    if (!await confirm({ title: "Remove this item?", message: `${item.name || "This item"} will be removed from the site when you save.`, action: "Remove item" })) return;
    const copy = structuredClone(data);
    resetFields(); setAttempted(false); copy[mode].splice(selected, 1); setData(copy); setSelected(0); setDirty(true);
  }
  async function save(published?: boolean) {
    if (!data || busy || saving.current || !configured || (!dirty && published === undefined)) return;
    const candidate = published === undefined || mode !== "products" ? data : { ...data, products: data.products.map((p, i) => i === selected ? { ...p, published } : p) };
    setAttempted(true);
    const parsed = validateCatalogue(candidate);
    if (!parsed.success) { const issues = formProblems(parsed.error.issues, "catalogue"); setMessage(""); selectProblem(issues[0]); return; }
    saving.current = true; setBusy(true); setMessage("Saving catalogue…");
    try {
      const catalogue = parsed.data;
      const response = await fetch("/admin/api/catalogue", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ catalogue, etag }) });
      const result = await response.json();
      if (!response.ok) throw new UserFacingError(result.error);
      setEtag(result.etag); setData(result.catalogue); setDirty(false); newCategories.current.clear(); newProducts.current.clear(); setMessage(published === true ? "Product published. It is now visible on the website." : published === false ? "Product unpublished. Its content is safely kept as a draft." : "Saved. Drafts stay private; published content is updated.", "success");
    } catch (e) { setMessage(userError(e, "Save failed. Your edits are still here."), "error"); }
    finally { saving.current = false; setBusy(false); }
  }
  async function upload(file?: File) {
    if (!file) return;
    if (file.size > 10_000_000) { setMessage("Choose an image smaller than 10 MB.", "error"); return; }
    setBusy(true); setMessage("Uploading image…");
    try {
      const body = await downscaleForUpload(file);
      const response = await fetch("/admin/api/media", { method: "POST", body });
      const result = await response.json();
      if (!response.ok) throw new UserFacingError(result.error);
      update({ image: result.image }); setMessage("Image uploaded. Save the catalogue to use it.");
    } catch (e) { setMessage(userError(e, "Upload failed"), "error"); }
    finally { setBusy(false); }
  }
  const current = data?.[mode][selected];
  const product = mode === "products" ? current as CmsProduct | undefined : undefined;
  const duplicateIndex = product && product.name.trim() && product.brand.trim() ? data!.products.findIndex((p, i) => i !== selected && normalize(p.name) === normalize(product.name) && normalize(p.brand) === normalize(product.brand)) : -1;
  return (
    <main onBlurCapture={onBlurCapture} className="mx-auto max-w-6xl px-5 py-10">
      {confirmationModal}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="text-3xl font-semibold">Catalogue</h1><p className="mt-2 text-ink-soft">Manage equipment, categories and product photos.</p></div>
        <button className={button} disabled={busy} onClick={async () => { if (!dirty || await confirm({ title: "Discard unsaved edits?", message: "Reload the saved catalogue? Your current unsaved edits will be lost.", action: "Discard and reload" })) { setBusy(true); void reload(); } }}>Reload</button>
      </div>
      <AdminSaveBar label={product ? product.published ? "Save changes" : "Save draft" : "Save catalogue"} onSave={() => save()} disabled={!configured || !dirty} busy={busy} dirty={dirty} tone={tone} message={message}>
        {product ? <button type="button" className="btn-outline min-h-11" disabled={busy || !configured} onClick={async () => {
          if (product.published && !await confirm({ title: "Unpublish this product?", message: "It will be hidden from the website, not deleted. Existing proformas are unchanged. This also saves your current catalogue edits.", action: "Unpublish product" })) return;
          await save(!product.published);
        }}>{product.published ? "Unpublish product" : "Publish product"}</button> : null}
      </AdminSaveBar>
      <p className="mt-3 text-sm text-steel">Saving keeps each item’s current publication status. These actions save all pending catalogue edits.</p>
      <FormProblems problems={attempted ? allProblems : []} onSelect={selectProblem} />
      {data ? <fieldset disabled={busy} className="mt-6 grid min-w-0 gap-6 md:grid-cols-[260px_minmax(0,1fr)] disabled:opacity-70">
        <aside className="min-w-0">
          <div className="mb-4 flex gap-2">{(["products", "categories"] as const).map((tab) => <button key={tab} className={`${button} ${mode === tab ? "bg-navy text-white hover:bg-navy-deep" : "bg-white"}`} aria-pressed={mode === tab} onClick={() => { setMode(tab); setSelected(0); }}>{tab === "products" ? "Products" : "Categories"}</button>)}</div>
          {mode === "products" ? <PublicationFilter value={status} onChange={setStatus} /> : null}
          <button className={`${button} my-3 w-full`} onClick={add}>Add {mode === "products" ? "product" : "category"}</button>
          {mode === "products" && !data.products.some((item) => matchesPublication(item.published, status)) ? <p className="mb-3 text-sm text-steel">{status === "all" ? "No products yet. Add your first product." : `No ${status === "draft" ? "draft" : "published"} products. Choose All to see the other products.`}</p> : null}
          <div className="max-h-[65vh] overflow-y-auto rounded-xl border border-hair bg-white">{data[mode].map((item, i) => mode === "products" && !matchesPublication((item as CmsProduct).published, status) ? null : <button key={i} className={`block w-full border-b border-hair px-4 py-3 text-left text-sm last:border-0 ${i === selected ? "bg-navy-tint font-semibold" : "hover:bg-paper"}`} onClick={() => setSelected(i)}>{item.name || "Untitled"}{"published" in item ? <span className="ml-2 text-xs text-steel">{item.published ? "Published" : "Draft"}</span> : null}</button>)}</div>
        </aside>
        {current ? <div className="min-w-0 rounded-xl border border-hair bg-white p-5 sm:p-7">
          <div className="mb-5 flex items-center justify-between gap-3"><h2 className="text-xl font-semibold">{current.name || "New item"}</h2><button className={button} onClick={remove}>Remove</button></div>
          {product ? <p className="mb-4 text-sm font-medium">{product.published ? "Published · visible on the website" : "Draft · only visible to admins"}</p> : null}
          {duplicateIndex >= 0 ? <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm"><p>Possible duplicate: another product has this name and brand. You can keep both if they are different models.</p><button type="button" className="min-h-11 underline" onClick={() => { setStatus("all"); setSelected(duplicateIndex); }}>Open existing product</button></div> : null}
          <p className="mb-4 text-sm text-steel">Fields marked Required must be filled in. Everything else is optional.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field required label="Name" path={`${mode}.${selected}.name`} problems={problems} value={current.name} onChange={(name) => update({ name })} />
            {product ? <Field required label="Brand" path={`${mode}.${selected}.brand`} problems={problems} value={product.brand} onChange={(brand) => update({ brand })} /> : null}
            <p className="sm:col-span-2 break-all text-sm text-steel">Website address: {product ? "/products/" : "/products?cat="}{current.slug}. Generated automatically; saved addresses stay the same.</p>
            <details key={`${mode}-${selected}`} className="sm:col-span-2"><summary className="min-h-11 cursor-pointer py-3 font-medium">Additional details (optional)</summary><div className="grid gap-4 pt-3 sm:grid-cols-2">
            {product ? <>
              <Field label="Origin" path={`${mode}.${selected}.origin`} problems={problems} value={product.origin} onChange={(origin) => update({ origin })} />
              <label className="text-sm">Category<select aria-label="Category" {...fieldProblemProps(problems, `${mode}.${selected}.category`)} className={input} value={product.category} onChange={(e) => update({ category: e.target.value })}><option value="">No category — show in All products</option>{data.categories.map((c, i) => <option key={i} value={c.slug}>{c.name || "Untitled category"}</option>)}</select><FieldProblem problems={problems} path={`${mode}.${selected}.category`} /></label>
              <label className="text-sm">Availability<select aria-label="Availability" {...fieldProblemProps(problems, `${mode}.${selected}.availability`)} className={input} value={product.availability} onChange={(e) => update({ availability: e.target.value as CmsProduct["availability"] })}>{["On request", "Indent order", "In stock, Addis Ababa"].map((s) => <option key={s}>{s}</option>)}</select><FieldProblem problems={problems} path={`${mode}.${selected}.availability`} /></label>
              <Field label="Lead time" path={`${mode}.${selected}.leadTime`} problems={problems} value={product.leadTime} onChange={(leadTime) => update({ leadTime })} />
              <div className="flex items-center gap-5"><label className="text-sm"><input type="checkbox" checked={product.featured} onChange={(e) => update({ featured: e.target.checked })} /> Featured</label></div>
              <label className="text-sm sm:col-span-2">Description<textarea aria-label="Description" {...fieldProblemProps(problems, `${mode}.${selected}.summary`)} className={input} rows={4} value={product.summary} onChange={(e) => update({ summary: e.target.value })} /><FieldProblem problems={problems} path={`${mode}.${selected}.summary`} /></label>
              <div className="sm:col-span-2"><h3 className="text-sm font-semibold">Specifications</h3>{product.specs.map((s, i) => <div key={i} className="mt-3 grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-start gap-2"><Field label={`Specification ${i + 1} label`} path={`${mode}.${selected}.specs.${i}.label`} problems={problems} value={s.label} onChange={(label) => update({ specs: product.specs.map((v, n) => n === i ? { ...v, label } : v) })} /><Field label={`Specification ${i + 1} value`} path={`${mode}.${selected}.specs.${i}.value`} problems={problems} value={s.value} onChange={(value) => update({ specs: product.specs.map((v, n) => n === i ? { ...v, value } : v) })} /><button aria-label={`Remove specification ${i + 1}`} className={`${button} px-2`} onClick={() => update({ specs: product.specs.filter((_, n) => n !== i) })}><X size={16} aria-hidden="true" /></button></div>)}<button className={`${button} mt-2`} onClick={() => update({ specs: [...product.specs, { label: "", value: "" }] })}>Add specification</button></div>
              <label className="text-sm sm:col-span-2">Included services (one per line)<textarea aria-label="Included services (one per line)" {...fieldProblemProps(problems, `${mode}.${selected}.services`)} className={input} rows={4} value={product.services.join("\n")} onChange={(e) => update({ services: e.target.value.split("\n") })} /><FieldProblem problems={problems} path={`${mode}.${selected}.services`} /></label>
            </> : <>
              <Field label="Short name" path={`${mode}.${selected}.short`} problems={problems} value={(current as CmsCategory).short} onChange={(short) => update({ short })} />
              <label className="text-sm sm:col-span-2">Description<textarea aria-label="Description" {...fieldProblemProps(problems, `${mode}.${selected}.blurb`)} rows={4} className={input} value={(current as CmsCategory).blurb} onChange={(e) => update({ blurb: e.target.value })} /><FieldProblem problems={problems} path={`${mode}.${selected}.blurb`} /></label>
            </>}
            <div className="sm:col-span-2"><label className="text-sm">Photo (JPEG, PNG, WebP, HEIC or TIFF; up to 10 MB, resized automatically)<input className={input} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/tiff" disabled={!configured} onChange={(e) => { void upload(e.target.files?.[0]); e.target.value = ""; }} /></label>
              {current.image ? <div className="mt-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt={current.name} src={`/admin/api/media?id=${encodeURIComponent(current.image.split("/").pop()!)}`} className="h-40 w-full rounded-lg object-contain" />
                <button className={`${button} mt-2`} onClick={() => update({ image: "" })}>Remove photo</button>
              </div> : null}
            </div>
          </div></details>
          </div>
        </div> : <p className="py-10 text-ink-soft">No {mode} yet. Add one to get started.</p>}
      </fieldset> : <button className={button} disabled={busy} onClick={reload}>Retry</button>}
    </main>
  );
}
function Field({ label, value, onChange, path = "", problems = [], required = false }: { label: string; value: string; onChange: (value: string) => void; path?: string; problems?: FormProblem[]; required?: boolean }) {
  return <label className="text-sm">{label}{required ? <span className="ml-2 text-xs text-steel">Required</span> : null}<input aria-required={required || undefined} {...fieldProblemProps(problems, path)} aria-label={label} className={input} value={value} onChange={(e) => onChange(e.target.value)} /><FieldProblem problems={problems} path={path} /></label>;
}
function validateCatalogue(data: Catalogue) {
  return catalogueSchema.safeParse({ ...data, products: data.products.map((product) => ({ ...product, services: product.services.map((service) => service.trim()).filter(Boolean) })) });
}

function normalize(value: string) { return value.normalize("NFKC").trim().replace(/\s+/g, " ").toLocaleLowerCase(); }
