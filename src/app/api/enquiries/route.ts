import { createHash, createHmac } from "node:crypto";
import { enquirySchema } from "@/lib/enquiry";
import { createEnquiry } from "@/lib/content-database";
import { requestBytes } from "@/lib/admin-api";

const responseHeaders = { "Cache-Control": "no-store" };

function clientKey(request: Request) {
  const ip = request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || "unknown";
  const secret = process.env.ENQUIRY_HASH_SECRET || process.env.CRON_SECRET;
  return secret
    ? createHmac("sha256", secret).update(ip).digest("hex")
    : createHash("sha256").update(`stem-medica:${ip}`).digest("hex");
}

function wantsHtml(request: Request) {
  return request.headers.get("content-type")?.includes("application/x-www-form-urlencoded")
    || request.headers.get("content-type")?.includes("multipart/form-data");
}

type Result = "sent" | "details" | "limit" | "unavailable";

/** Partnership submissions return to /partnership/*, quotations to /quote/*. */
function resultRedirect(result: Result, kind: string) {
  const base = kind === "partnership" ? "/partnership" : "/quote";
  return new Response(null, { status: 303, headers: { ...responseHeaders, Location: `${base}/${result}` } });
}

export async function POST(request: Request) {
  const html = wantsHtml(request);
  let kind = "quotation";
  try {
    const raw = html
      ? Object.fromEntries((await request.formData()).entries())
      : JSON.parse((await requestBytes(request, 10_000)).toString("utf8"));
    kind = typeof (raw as { kind?: unknown }).kind === "string" ? (raw as { kind: string }).kind : "quotation";
    const parsed = enquirySchema.safeParse(raw);
    if (!parsed.success) {
      if (html) return resultRedirect("details", kind);
      return Response.json({ message: parsed.error.issues[0]?.message || "Check the highlighted details and try again." }, { status: 400, headers: responseHeaders });
    }
    if (parsed.data.website) return html
      ? resultRedirect("sent", kind)
      : Response.json({ submitted: true }, { status: 201, headers: responseHeaders });
    kind = parsed.data.kind;
    const input = {
      kind: parsed.data.kind,
      facility: parsed.data.facility,
      contact: parsed.data.contact,
      phone: parsed.data.phone,
      email: parsed.data.email,
      equipment: parsed.data.equipment,
      quantity: parsed.data.quantity,
      notes: parsed.data.notes,
    };
    const allowed = await createEnquiry(input, clientKey(request), request.headers.get("user-agent"));
    if (!allowed) {
      if (html) return resultRedirect("limit", kind);
      return Response.json({ message: "Too many requests were sent from this connection. Please call or try again in one hour." }, { status: 429, headers: responseHeaders });
    }
    return html
      ? resultRedirect("sent", kind)
      : Response.json({ submitted: true }, { status: 201, headers: responseHeaders });
  } catch {
    if (html) return resultRedirect("unavailable", kind);
    return Response.json({ message: "We couldn’t save your request. Please call or try again." }, { status: 503, headers: responseHeaders });
  }
}
