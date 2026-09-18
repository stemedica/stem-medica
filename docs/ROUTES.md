# Application routes

The full application is mounted at the site root. Public pages live in `src/app/(site)/`; protected administration, authentication, API and media handlers use their own root route directories.

| URL | Purpose |
| --- | --- |
| `/` | Website homepage |
| `/products`, `/blog` | Catalogue and updates |
| `/admin` | Protected admin dashboard |
| `/auth/login` | Admin sign-in |
| `/api/auth/*` | Private email/password session endpoints |
| `/admin/api/*` | Session- and origin-protected CMS APIs |
| `/media/*` | Published media |
| `/api/cron/cleanup` | Secret-protected scheduled draft cleanup |

Database image references remain `/media/...`, so no content migration is required. Existing local and Neon data, accounts, and media are preserved.

Authentication uses `/api/auth`; same-origin checks, database sessions, login throttling and secure cookies remain enabled.

The Vercel cron path is configured in `vercel.json`. Apply deployment configuration through the normal deployment process.
