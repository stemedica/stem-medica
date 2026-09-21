# Production architecture

STEM MEDICA is a Next.js 16 application deployed on Vercel. Public pages, the protected admin workspace, authentication, CMS APIs, media delivery and quotation requests live in one application.

## Data

Production uses one Neon Postgres database:

- `auth_*` tables store the administrator account, password credential, sessions and sign-in throttles.
- `content_document` stores the current catalogue, posts and temporary proforma drafts as atomic JSON documents.

Runtime traffic uses pooled `DATABASE_URL`. Reviewed migrations use direct `DATABASE_URL_UNPOOLED`. Production deliberately has no `CMS_DATABASE_URL` override, so authentication and CMS traffic cannot silently point at different Neon branches.

Images use a private Vercel Blob store. `/media/[id]` only serves files referenced by published content. The database starts empty; no test catalogue or sample posts are copied into production.

## Main flows

### Public quotation request

`/quote` and `/partnership` call a Server Action that validates the fields, drops anything caught by the honeypot, throttles bursts per instance, then emails the enquiry through Resend with the visitor's address as `Reply-To`. Nothing is stored: the inbox is the record.

Delivery needs `RESEND_API_KEY`. `ENQUIRY_FROM` must be an address on a domain verified in Resend; while `stemedicaet.com` has no DNS, it stays on `onboarding@resend.dev`, which Resend only delivers to the account owner's own address — so `ENQUIRY_TO` overrides the public address in `src/lib/site.ts`. When the send fails the form says so and offers the phone number and WhatsApp rather than losing the enquiry silently.

### Admin authentication

The first-party email/password system uses scrypt password hashes and eight-hour database sessions. Session cookies are HTTP-only, same-site and secure in production. Public signup, QR authentication and Better Auth are not present.

### Publishing

Catalogue and post editors save one current document with optimistic concurrency. Draft items remain private until published. Public reads use a five-minute cache that is invalidated after a successful save. Version history is intentionally not retained.

### Proformas

The builder stores optional drafts for seven days and exports from the browser. The scheduled cleanup route removes expired drafts. Issued files are not stored by the application.

## Deployment safeguards

- Vercel production uses the Neon integration variables and `CONTENT_STORAGE_DRIVER=postgres`.
- Content migrations are kept in `drizzle-content/`; auth migrations are kept in `drizzle/`.
- Production migrations must be run from a clean directory or CI environment so local `.env` files cannot override Vercel values.
- Security headers are defined in `next.config.ts`.
- `robots.ts` excludes admin, auth and API routes; `sitemap.ts` includes current published content.

The public canonical URL is `https://www.stemedicaet.com`. See [operations](OPERATIONS.md) for launch and recovery checks.
