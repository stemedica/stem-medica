# Production operations

## Before deployment

Run:

```sh
npm run lint
npx tsc --noEmit
npm test
npm run build -- --webpack
```

Review generated SQL before applying it. Runtime connections must use pooled URLs; migrations must use direct URLs.

## Environment

Required production values:

- `DATABASE_URL` and `DATABASE_URL_UNPOOLED` from the Neon integration
- `CONTENT_STORAGE_DRIVER=postgres`
- private Vercel Blob credentials
- `CRON_SECRET`

Do not add `CMS_DATABASE_URL` in production. It is reserved for isolated local or preview work. `ADMIN_USER`, `ADMIN_PASSWORD`, Better Auth secrets and QR-authentication values are obsolete.

## Deployment verification

Check the public home, catalogue, blog, quote form, `robots.txt` and `sitemap.xml`. Verify security headers, then sign in and test the Requests inbox. An empty catalogue or blog is valid; the UI must show its empty state without test content.

## Backups and recovery

Use Neon restore or a database branch before risky data work. For a manual export, use the direct connection and keep the dump outside the repository. The CMS does not maintain application-level version history.

If the CMS cannot reach Neon, public pages may serve their last cached response while the admin shows an availability error. Verify the database host, Vercel environment scope and migration table before retrying writes.

## External launch work

`stemedicaet.com` must have working DNS and be connected to Vercel before it replaces the current canonical Vercel URL. Publish an email address only after its domain has MX records and delivery has been tested.
