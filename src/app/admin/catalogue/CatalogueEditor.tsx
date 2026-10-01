"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { control, TextField, TextareaField, SelectField, CheckboxField, FileField, Panel, StatusPill, EmptyState } from "../ui";
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
import { FormProblems, focusProblem } from "@/components/FormProblems";
import { X } from "lucide-react";

const button = "min-h-11 min-w-11 rounded-lg border border-hair px-4 py-2 text-sm font-medium hover:border-navy disabled:cursor-not-allowed disabled:opacity-50";
const blankCategory = (): CmsCategory => ({ slug: "", name: "", short: "", blurb: "", image: "" });
const blankProduct = (category: string): CmsProduct => ({ slug: "", name: "", brand: "", model: "", origin: "", category, image: "", summary: "", availability: "In stock, Addis Ababa", leadTime: "From Stock", specs: [], services: [], featured: false, published: false });

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
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
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
    if (data[mode].length >= (mode === "products" ? 300 : 40)) { setMessage("This list has reached its limit. Remove an unused item before adding another.", "warning"); return; }
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
  // Index is kept alongside each item so selection still addresses the real
  // array position after filtering.
  const visible = (data?.[mode] ?? [])
    .map((item, index) => ({ item, index }))
    .filter(({ item }) =>
      (mode !== "products" || matchesPublication((item as CmsProduct).published, status))
      && (mode !== "products" || !categoryFilter
        || (categoryFilter === "none"
          ? !(item as CmsProduct).category
          : (item as CmsProduct).category === categoryFilter))
      && (!query.trim()
        || (item.name || "").toLowerCase().includes(query.trim().toLowerCase())
        || ("brand" in item && (item.brand || "").toLowerCase().includes(query.trim().toLowerCase()))
        || ("model" in item && ((item as CmsProduct).model || "").toLowerCase().includes(query.trim().toLowerCase()))));
  const current = data?.[mode][selected];
  const product = mode === "products" ? current as CmsProduct | undefined : undefined;
  const duplicateIndex = product && product.name.trim() && product.brand.trim() ? data!.products.findIndex((p, i) => i !== selected && normalize(p.name) === normalize(product.name) && normalize(p.brand) === normalize(product.brand) && normalize(p.model || "") === normalize(product.model || "")) : -1;
  return (
    <main onBlurCapture={onBlurCapture} className="mx-auto max-w-6xl px-5 py-8 sm:py-10">
      {confirmationModal}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-navy sm:text-3xl">Catalogue</h1>
          <p className="mt-1.5 text-sm text-ink-soft">Equipment, categories and product photos.</p>
        </div>
        <button className={button} disabled={busy} onClick={async () => { if (!dirty || await confirm({ title: "Discard unsaved edits?", message: "Reload the saved catalogue? Your current unsaved edits will be lost.", action: "Discard and reload" })) { setBusy(true); void reload(); } }}>Reload</button>
      </div>

      <AdminSaveBar label={product ? product.published ? "Save changes" : "Save draft" : "Save catalogue"} onSave={() => save()} disabled={!configured || !dirty} busy={busy} dirty={dirty} tone={tone} message={message}>
        {product ? <button type="button" className="btn-outline min-h-11" disabled={busy || !configured} onClick={async () => {
          if (product.published && !await confirm({ title: "Unpublish this product?", message: "It will be hidden from the website, not deleted. Existing proformas are unchanged. This also saves your current catalogue edits.", action: "Unpublish product" })) return;
          await save(!product.published);
        }}>{product.published ? "Unpublish product" : "Publish product"}</button> : null}
      </AdminSaveBar>

      <FormProblems problems={attempted ? allProblems : []} onSelect={selectProblem} />

      {data ? <fieldset disabled={busy} className="mt-6 grid min-w-0 gap-6 lg:grid-cols-[288px_minmax(0,1fr)] disabled:opacity-70">
        <aside className="min-w-0">
          <div role="tablist" aria-label="Catalogue section" className="flex gap-1 rounded-lg bg-paper-2 p-1">
            {(["products", "categories"] as const).map((tab) => (
              <button key={tab} role="tab" aria-selected={mode === tab}
                className={`min-h-9 flex-1 rounded-md px-3 text-sm font-medium transition-colors ${mode === tab ? "bg-white text-navy shadow-sm" : "text-ink-soft hover:text-ink"}`}
                onClick={() => { setMode(tab); setSelected(0); setQuery(""); setCategoryFilter(""); }}>
                {tab === "products" ? "Products" : "Categories"}
                <span className="ml-1.5 text-xs font-normal text-steel">{data[tab].length}</span>
              </button>
            ))}
          </div>

          <label className="mt-3 block">
            <span className="sr-only">Search {mode}</span>
            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)}
              placeholder={`Search ${mode}…`} className={control} />
          </label>

          {mode === "products" ? <div className="mt-3 space-y-3">
            <PublicationFilter value={status} onChange={setStatus} />
            <label className="block">
              <span className="sr-only">Filter by category</span>
              <div className="relative">
                <select value={categoryFilter} onChange={(event) => { setCategoryFilter(event.target.value); setSelected(0); }}
                  aria-label="Filter by category" className={`${control} appearance-none pr-10`}>
                  <option value="">All categories</option>
                  <option value="none">No category</option>
                  {data.categories.map((category) => (
                    <option key={category.slug} value={category.slug}>
                      {category.name || "Untitled category"} ({data.products.filter((product) => product.category === category.slug).length})
                    </option>
                  ))}
                </select>
                <svg aria-hidden="true" viewBox="0 0 20 20" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel">
                  <path d="M6 8l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </label>
          </div> : null}

          <button className={`${button} mt-3 w-full`} onClick={add}>
            Add {mode === "products" ? "product" : "category"}
          </button>

          <div className="mt-3 max-h-[60vh] min-w-0 overflow-y-auto overscroll-contain rounded-xl border border-hair bg-white">
            {visible.length ? visible.map(({ item, index }) => (
              <button key={index} aria-current={index === selected ? "true" : undefined}
                className={`block w-full border-b border-hair px-4 py-3 text-left last:border-0 transition-colors ${index === selected ? "bg-navy-tint" : "hover:bg-paper"}`}
                onClick={() => setSelected(index)}>
                <span className={`block truncate text-sm ${index === selected ? "font-semibold text-navy" : "text-ink"}`}>{item.name || "Untitled"}</span>
                <span className="mt-1 flex items-center gap-2">
                  {"published" in item ? <StatusPill published={(item as CmsProduct).published} /> : null}
                  {mode === "products" ? (
                    <span className="truncate text-xs text-steel">
                      {("brand" in item && item.brand && item.brand !== "—") ? item.brand : ""}
                      {("model" in item && (item as CmsProduct).model) ? ` · ${(item as CmsProduct).model}` : ""}
                      {(item as CmsProduct).category ? ` (${data.categories.find((c) => c.slug === (item as CmsProduct).category)?.name ?? ""})` : ""}
                    </span>
                  ) : null}
                </span>
              </button>
            )) : (
              <p className="px-4 py-8 text-center text-sm text-steel">
                {query || categoryFilter || status !== "all"
                  ? "Nothing matches these filters."
                  : `No ${mode} yet.`}
              </p>
            )}
          </div>
        </aside>

        {current ? <div className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <h2 className="truncate text-xl font-semibold text-navy">{current.name || "New item"}</h2>
              {product ? <StatusPill published={product.published} /> : null}
            </div>
            <button className={button} onClick={remove}>Remove</button>
          </div>

          {duplicateIndex >= 0 ? (
            <div role="status" className="rounded-xl border border-hair bg-paper p-4 text-sm">
              <p className="font-medium text-ink">Possible duplicate</p>
              <p className="mt-1 text-ink-soft">Another product has this name and brand. Keep both if they are different models.</p>
              <button type="button" className="mt-2 min-h-11 text-navy underline underline-offset-4" onClick={() => { setStatus("all"); setSelected(duplicateIndex); }}>Open the existing product</button>
            </div>
          ) : null}

          <Panel title="Basics" description={<>Website address: <span className="break-all font-medium text-ink">{product ? "/products/" : "/products?cat="}{current.slug}</span>. Generated from the name; saved addresses never change.</>}>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField required label="Name" path={`${mode}.${selected}.name`} problems={problems} value={current.name} onChange={(name) => update({ name })} />
              {product ? <TextField label="Brand" hint="Manufacturer or brand name" path={`${mode}.${selected}.brand`} problems={problems} value={product.brand} onChange={(brand) => update({ brand })} /> : null}
              {product ? <>
                <TextField label="Model" hint="Model number or series (e.g. BC-30S, HKN-90)" path={`${mode}.${selected}.model`} problems={problems} value={product.model || ""} onChange={(model) => update({ model })} />
                <SelectField label="Category" path={`${mode}.${selected}.category`} problems={problems} value={product.category} onChange={(category) => update({ category })}>
                  <option value="">No category — show in All products</option>
                  {data.categories.map((c, i) => <option key={i} value={c.slug}>{c.name || "Untitled category"}</option>)}
                </SelectField>
                <SelectField label="Availability" path={`${mode}.${selected}.availability`} problems={problems} value={product.availability} onChange={(availability) => update({ availability: availability as CmsProduct["availability"] })}>
                  {["On request", "Indent order", "In stock, Addis Ababa"].map((option) => <option key={option}>{option}</option>)}
                </SelectField>
                <TextField label="Origin" path={`${mode}.${selected}.origin`} problems={problems} value={product.origin} onChange={(origin) => update({ origin })} />
                <TextField label="Lead time" path={`${mode}.${selected}.leadTime`} problems={problems} value={product.leadTime} onChange={(leadTime) => update({ leadTime })} />
                <div className="sm:col-span-2">
                  <CheckboxField label="Feature on the homepage" hint="Featured products appear in the selected equipment row." checked={product.featured} onChange={(featured) => update({ featured })} />
                </div>
              </> : (
                <TextField label="Short name" hint="Used on compact cards" path={`${mode}.${selected}.short`} problems={problems} value={(current as CmsCategory).short} onChange={(short) => update({ short })} />
              )}
            </div>
          </Panel>

          <Panel title="Description" description={product ? "Shown on the product page and in search results." : "Shown at the top of the category page."}>
            {product
              ? <TextareaField label="Description" path={`${mode}.${selected}.summary`} problems={problems} rows={4} value={product.summary} onChange={(summary) => update({ summary })} />
              : <TextareaField label="Description" path={`${mode}.${selected}.blurb`} problems={problems} rows={4} value={(current as CmsCategory).blurb} onChange={(blurb) => update({ blurb })} />}
          </Panel>

          {product ? <>
            <Panel title="Specifications" description="Shown as a table on the product page." actions={
              <button className={button} onClick={() => update({ specs: [...product.specs, { label: "", value: "" }] })}>Add row</button>
            }>
              {product.specs.length ? <div className="space-y-3">
                {product.specs.map((spec, i) => (
                  <div key={i} className="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto]">
                    <TextField label={`Specification ${i + 1} label`} path={`${mode}.${selected}.specs.${i}.label`} problems={problems} value={spec.label} onChange={(label) => update({ specs: product.specs.map((v, n) => n === i ? { ...v, label } : v) })} />
                    <TextField label={`Specification ${i + 1} value`} path={`${mode}.${selected}.specs.${i}.value`} problems={problems} value={spec.value} onChange={(value) => update({ specs: product.specs.map((v, n) => n === i ? { ...v, value } : v) })} />
                    <button aria-label={`Remove specification ${i + 1}`} className={`${button} h-11 self-end px-2.5`} onClick={() => update({ specs: product.specs.filter((_, n) => n !== i) })}><X size={16} aria-hidden="true" /></button>
                  </div>
                ))}
              </div> : <p className="text-sm text-steel">No specifications yet. Add a row for each figure a buyer needs.</p>}
            </Panel>

            <Panel title="Included with supply" description="One per line. Listed under the specifications.">
              <TextareaField label="Included services" path={`${mode}.${selected}.services`} problems={problems} rows={4} value={product.services.join("\n")} onChange={(value) => update({ services: value.split("\n") })} />
            </Panel>
          </> : null}

          <Panel title="Photo" description="JPEG, PNG or WebP, up to 10 MB. Resized in your browser before upload.">
            <FileField label="Upload a photo" accept="image/jpeg,image/png,image/webp" disabled={!configured || busy}
              onFiles={(files) => upload(files[0])} />
            {current.image ? <div className="mt-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt={current.name} src={`/admin/api/media?id=${encodeURIComponent(current.image.split("/").pop()!)}`} className="aspect-video w-full rounded-lg border border-hair bg-paper object-contain" />
              <button className={`${button} mt-3`} onClick={() => update({ image: "" })}>Remove photo</button>
            </div> : null}
          </Panel>
        </div> : (
          <EmptyState
            title={`No ${mode} selected`}
            message={data[mode].length ? `Choose one from the list to edit it.` : `Add your first ${mode === "products" ? "product" : "category"} to get started.`}
            action={<button className={button} onClick={add}>Add {mode === "products" ? "product" : "category"}</button>}
          />
        )}
      </fieldset> : <button className={button} disabled={busy} onClick={reload}>Retry</button>}
    </main>
  );
}
function validateCatalogue(data: Catalogue) {
  return catalogueSchema.safeParse({ ...data, products: data.products.map((product) => ({ ...product, services: product.services.map((service) => service.trim()).filter(Boolean) })) });
}

function normalize(value: string) { return value.normalize("NFKC").trim().replace(/\s+/g, " ").toLocaleLowerCase(); }
