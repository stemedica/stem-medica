/**
 * Minimal Resend transport. A direct fetch rather than the SDK: one endpoint is
 * all this site sends, and a dependency here would ship for no benefit.
 *
 * Without a verified sending domain Resend only accepts `onboarding@resend.dev`
 * as the sender, and only delivers to the address that owns the API key. Once
 * the domain has DNS and is verified, set ENQUIRY_FROM to an address on it.
 */
const ENDPOINT = "https://api.resend.com/emails";
const TIMEOUT_MS = 10_000;

/** Raised when Resend refuses the message; the detail is for the server log only. */
export class EnquiryNotSent extends Error {}

export type Mail = {
  to: string;
  subject: string;
  text: string;
  html: string;
  /** Lets the recipient reply straight to the enquirer. */
  replyTo?: string;
};

export function mailFrom() {
  return process.env.ENQUIRY_FROM || "STEM MEDICA <onboarding@resend.dev>";
}

export function mailTo(fallback: string) {
  return process.env.ENQUIRY_TO || fallback;
}

export async function sendMail(mail: Mail) {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new EnquiryNotSent("RESEND_API_KEY is not set");

  // A dropped connection to the API was observed in testing, and losing an
  // enquiry to one is not acceptable. Retried only on a transport failure: a
  // rejection Resend actually answered will not succeed by asking again.
  try {
    return await post(key, mail);
  } catch (error) {
    if (error instanceof EnquiryNotSent) throw error;
    await new Promise((resume) => setTimeout(resume, 400));
    return post(key, mail);
  }
}

async function post(key: string, mail: Mail) {
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: mailFrom(),
      to: [mail.to],
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
      ...(mail.replyTo ? { reply_to: mail.replyTo } : {}),
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (response.ok) return (await response.json().catch(() => ({}))) as { id?: string };

  const detail = await response.text().catch(() => "");
  throw new EnquiryNotSent(`Resend responded ${response.status}: ${detail.slice(0, 500)}`);
}
