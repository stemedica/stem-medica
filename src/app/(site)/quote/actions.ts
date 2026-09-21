"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { site } from "@/lib/site";
import { EnquiryNotSent, mailTo, sendMail } from "@/lib/resend";
import { copy, type FormCopy } from "./form-copy";
import { enquiryHtml, enquirySubject, enquiryText } from "./enquiry-message";

const schema = z.object({
  kind: z.enum(["quotation", "partnership"]),
  facility: z.string().trim().min(1).max(200),
  contact: z.string().trim().min(1).max(200),
  phone: z.string().trim().min(1).max(200),
  email: z.union([z.literal(""), z.email().max(200)]).default(""),
  equipment: z.string().trim().min(1).max(500),
  quantity: z.string().trim().max(20).default(""),
  notes: z.string().trim().max(3000).default(""),
  /** Honeypot: a real visitor never sees this field, so any value means a bot. */
  website: z.string().max(200).default(""),
});

/**
 * Per-instance throttle. Serverless spreads requests across instances, so this
 * slows a burst rather than enforcing a global quota — enough to keep a stuck
 * submit button or a crude script from draining the sending allowance, and the
 * honeypot above catches the ordinary form spammer.
 */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 3;
const recent = new Map<string, number[]>();

function withinRate(key: string) {
  const now = Date.now();
  const hits = (recent.get(key) ?? []).filter((at) => now - at < WINDOW_MS);
  if (hits.length >= MAX_PER_WINDOW) return false;
  hits.push(now);
  recent.set(key, hits);
  if (recent.size > 500) for (const [id, at] of recent) if (now - (at.at(-1) ?? 0) > WINDOW_MS) recent.delete(id);
  return true;
}

export type EnquiryResult = { ok: true } | { ok: false; message: string };

const TROUBLE = `We couldn’t send that just now. Please call ${site.phone} or message us on WhatsApp and we’ll pick it up right away.`;

export async function sendEnquiry(raw: Record<string, string>): Promise<EnquiryResult> {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: "Please check the form and fill in the required fields." };
  }

  const fields = parsed.data;
  // Silently accept the honeypot: telling a bot it was caught only helps it.
  if (fields.website.trim()) return { ok: true };

  const forwarded = (await headers()).get("x-forwarded-for") ?? "";
  if (!withinRate(forwarded.split(",")[0].trim() || "unknown")) {
    return { ok: false, message: `That’s a few requests in quick succession. Please wait a minute, or call ${site.phone}.` };
  }

  const variant: FormCopy = copy[fields.kind];
  try {
    await sendMail({
      to: mailTo(site.email),
      subject: enquirySubject(fields, variant),
      text: enquiryText(fields, variant),
      html: enquiryHtml(fields, variant),
      replyTo: fields.email || undefined,
    });
    return { ok: true };
  } catch (error) {
    console.error("[enquiry]", error instanceof EnquiryNotSent ? error.message : error);
    return { ok: false, message: TROUBLE };
  }
}
