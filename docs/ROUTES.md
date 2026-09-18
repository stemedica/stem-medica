# Application routes

The full application is mounted at the site root. Public pages live in `src/app/(site)/`; protected administration, authentication, API and media handlers use their own root route directories.

| URL | Purpose |
| --- | --- |
| `/` | Website homepage |
| `/products`, `/blog` | Catalogue and updates |
| `/admin` | Protected admin dashboard |
| `/auth/login` | Admin sign-in |
| `/api/auth/*` | Better Auth endpoints |
| `/admin/api/*` | Session- and origin-protected CMS APIs |
| `/media/*` | Published media |
| `/api/cron/cleanup` | Secret-protected scheduled draft cleanup |

Database image references remain `/media/...`, so no content migration is required. Existing local and Neon data, accounts, and media are preserved.

Keep `BETTER_AUTH_URL` set to the canonical origin, such as `https://stemedicaet.com` or the local development origin. Authentication uses `/api/auth`; existing origin checks, session checks, optional authenticator, and cookie security remain enabled.

The Vercel cron path is configured in `vercel.json`. Apply deployment configuration through the normal deployment process.
