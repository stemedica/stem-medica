# Admin: proforma builder

Internal tool at `/admin`, also served at the root of any `admin.*` hostname.

## Can this run on Vercel's free tier?

Mostly, with one real caveat and one licensing problem.

| Need | Hobby (free) | Notes |
| --- | --- | --- |
| `admin.stemedicaet.com` subdomain | **Yes** | Custom domains are included on Hobby. |
| Platform password protection | **No** | Vercel's Deployment Protection password is a Pro feature (~$20/mo). |
| App-level auth | **Yes** | Which is why the gate lives in `src/proxy.ts`. |
| Proxy (middleware) | **Yes** | Included on Hobby. |
| PDF / document export | **Yes** | Entirely client-side, no server cost. |

**The licensing problem:** Vercel's Hobby plan is for non-commercial use. This is a
commercial company website, so strictly it belongs on Pro. That is a business
decision, not a technical blocker, but it should be a conscious one: Pro also
brings the platform password protection that would make the app-level gate below
unnecessary.

## How the gate works

`src/proxy.ts` (Next 16 renamed `middleware.ts` to `proxy.ts`) does two things:

1. Rewrites requests arriving on an `admin.*` host to `/admin`, so the subdomain
   shows the builder and nothing else.
2. Requires HTTP Basic auth for anything under `/admin`, on any hostname.

It **fails closed**: with no credentials configured the admin is unreachable
rather than open.

```bash
# .env.local, and Vercel → Settings → Environment Variables
ADMIN_USER=...
ADMIN_PASSWORD=...
```

**What this is and isn't.** Basic auth over HTTPS keeps the page out of public
hands and out of search engines. It is a shared password, not a user system:
there are no accounts, no audit trail, and no per-person revocation. Rotate it by
changing the env var and redeploying. If the admin ever holds anything sensitive,
replace this with real auth.

## Setting up the subdomain

1. Vercel → Project → Settings → Domains → add `admin.stemedicaet.com`.
2. Add the CNAME Vercel gives you at your DNS provider.
3. Nothing else: `proxy.ts` already routes that hostname.

Until the domain exists, reach it at `/admin` on the main URL.

## Creating a proforma

Fill the left column, watch the A4 page on the right, then:

- **Print / PDF** opens the browser print dialogue. Choose "Save as PDF". The
  print stylesheet drops the interface and prints the document alone at A4.
- **Download .doc** produces a Word-compatible HTML file. It opens in Word,
  LibreOffice and Google Docs, where it can be saved as `.docx`.

Both run in the browser. Nothing is uploaded, and no PDF or DOCX library is
bundled, which is what keeps the page light.

> If a true OOXML `.docx` is ever required rather than a Word-readable `.doc`,
> that needs a zip writer (`docx`, ~500KB). Deliberately not included.

## Known limitations

- **The proforma counter is per browser.** `SM/PI/<year>/<seq>` increments in
  `localStorage`, so two people on two machines will both issue `0001`. Fine for
  one person on one machine; anything more needs a database counter. This is the
  first thing to fix if the tool gets real use.
- **Drafts are per browser** for the same reason. Issuer details persist, so they
  only need entering once.
- **The template is a reasonable default, not STEM MEDICA's.** Fields are there
  for TIN, VAT registration, bank details, validity and delivery/payment terms,
  but the real template, the correct VAT treatment and the required legal wording
  need to come from Geremew before this issues anything to a client.
- **Currency is a free-text field.** Equipment is imported, so quoting ETB
  against a USD cost needs a stated rate and date on the document. Add that to
  the notes until the template says otherwise.
