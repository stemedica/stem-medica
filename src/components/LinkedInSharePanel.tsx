"use client";

import { useRef, useState } from "react";
import type { CmsPost } from "@/lib/post-schema";
import { linkedInShare } from "@/lib/linkedin-share";
import { site } from "@/lib/site";

export function LinkedInSharePanel({ post, dirty, previewMode }: { post: CmsPost; dirty: boolean; previewMode: boolean }) {
  const { text, url } = linkedInShare(post);
  const [shareText, setShareText] = useState(text);
  const [message, setMessage] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const textArea = useRef<HTMLTextAreaElement>(null);
  const ready = post.published && !dirty;
  const images = [...new Set([post.image, ...(post.gallery ?? []).map(image => image.src)].filter(Boolean))];
  async function copy(value: string) {
    try { await navigator.clipboard.writeText(value); setMessage("Copied. Paste into LinkedIn and review before posting."); }
    catch { textArea.current?.focus(); textArea.current?.select(); setMessage("Clipboard access is unavailable. Select and copy the suggested text below."); }
  }
  return <details className="rounded-xl border border-hair bg-white p-4 sm:p-5">
    <summary className="min-h-11 cursor-pointer py-2 font-semibold text-navy">Share to LinkedIn</summary>
    <section aria-label="LinkedIn sharing" className="mt-3 space-y-4">
      <p className="text-sm leading-relaxed text-ink-soft">Manual sharing · Automatic company-page posting is not connected. Nothing is posted when you save or publish here.</p>
      {!ready ? <p className="rounded-lg bg-navy-tint p-3 text-sm text-navy">{!post.published ? "Publish this article before sharing it." : "Save your changes before sharing the latest version."}</p> : <>
        {previewMode ? <p className="rounded-lg bg-navy-tint p-3 text-sm text-navy">Local / preview site: this article may not exist on the live website. You can preview and copy the text, but opening LinkedIn is disabled here.</p> : null}
        <label className="block text-sm font-medium">LinkedIn post text<textarea ref={textArea} value={shareText} maxLength={3000} onChange={event => { setShareText(event.target.value); setMessage(""); }} rows={7} className="mt-2 w-full rounded-lg border border-hair bg-paper p-3 text-base font-normal" /><span className="mt-1 block text-xs font-normal text-steel">Customize this copy without changing the blog. Temporary text—not saved when you leave. {shareText.length}/3000 characters.</span></label>
        <p className="break-all text-sm text-ink-soft">Article link: {url}</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-outline min-h-11" disabled={!shareText.trim()} onClick={() => copy(shareText)}>Copy post text</button>
          <button type="button" className="btn-ghost min-h-11" onClick={() => copy(url)}>Copy article link</button>
        </div>
        {images.length ? <div className="space-y-2"><h3 className="text-sm font-semibold text-navy">Images for your LinkedIn post</h3><p className="text-xs text-steel">Download any of these images, then attach them in LinkedIn. You can also upload different images there.</p><div className="flex flex-wrap gap-2">{images.map((src, index) => <a key={src} className="btn-outline min-h-11" href={`/test/admin/api/media?id=${src.split("/").pop()}`} download={`stem-medica-image-${index + 1}.${src.split(".").pop()}`}>Download {src === post.image ? "cover" : `image ${index + 1}`}</a>)}</div></div> : null}
        <p className="text-sm leading-relaxed text-ink-soft">On LinkedIn, open your company page’s admin view and create a post as STEM MEDICA—not your personal profile. Paste the text, review the link preview and publish there. Gallery images are not transferred; add them on LinkedIn if needed.</p>
        {!previewMode ? <label className="flex min-h-11 items-start gap-3 text-sm"><input type="checkbox" className="mt-1 h-5 w-5 shrink-0 accent-navy" checked={confirmed} onChange={event => setConfirmed(event.target.checked)} />I have checked that this article is publicly available and the configured LinkedIn page is STEM MEDICA’s.</label> : null}
        {!previewMode && confirmed ? <a className="btn-outline min-h-11" href={site.linkedin} target="_blank" rel="noopener noreferrer">Open LinkedIn company page (new tab)</a> : <button type="button" className="btn-outline min-h-11 disabled:opacity-50" disabled>Open LinkedIn company page</button>}
        <p className="text-xs text-steel">This website cannot confirm whether you posted on LinkedIn. Check the company feed before posting again. Manage existing LinkedIn posts in LinkedIn itself; website edits do not update them.</p>
        <p className="text-xs text-steel">Choose your photos before publishing: LinkedIn allows text edits, but uploaded photos cannot be edited after posting.</p>
      </>}
      <p role="status" aria-live="polite" className="text-sm text-navy">{ready ? message : ""}</p>
    </section>
  </details>;
}
