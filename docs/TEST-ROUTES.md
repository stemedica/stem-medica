# Maintenance root and /test preview

The working application lives in `src/app/test/`. The site root is a separate, static maintenance page in `src/app/page.tsx`; it does not query the CMS and does not advertise preview links.

| URL | Purpose |
| --- | --- |
| `/` | Maintenance message and contact details |
| `/test` | Full website preview |
| `/test/products`, `/test/blog` | Catalogue and blog |
| `/test/admin` | Protected admin dashboard |
| `/test/auth/login` | Admin sign-in |
| `/test/api/auth/*` | Better Auth endpoints |
| `/test/admin/api/*` | Session- and origin-protected CMS APIs |
| `/test/media/*` | Published media |
| `/test/api/cron/cleanup` | Secret-protected scheduled draft cleanup |

Old unprefixed application routes return 404. Public static assets such as the logo and Next's generated assets remain at their normal root paths. This is a physical route move, not a global Next basePath, so the root maintenance page remains independent.

Database image references remain `/media/...`; `publicMediaUrl` converts them only at rendering time. No content migration, password reset, account deletion or database switch is required. Existing local/Neon data and media are preserved.

Keep `BETTER_AUTH_URL` set to the canonical **origin** (for example `https://stemedicaet.com`, or your existing localhost origin), without `/test`. The auth client/server use `/test/api/auth` explicitly. Existing origin checks, session checks, optional authenticator and cookie security stay enabled.

The preview sends `X-Robots-Tag: noindex, nofollow, noarchive` and no-index page metadata. **This is not password protection for the public preview.** Anyone who knows `/test` can browse published content; admin remains protected. LinkedIn publishing links remain disabled in this preview, even when deployed on a production hostname.

The Vercel cron path is updated in `vercel.json`. Apply this configuration through the normal deployment process. No deployment or remote Git push is performed by the route-change commit itself.
