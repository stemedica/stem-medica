# Admin authentication

Better Auth provides email/password login with a 10-character password minimum. Authenticator QR enrollment and recovery codes are optional under Security. Once an administrator enables an authenticator, subsequent sign-ins require its code. Neon stores accounts, encrypted authenticator secrets, sessions and rate-limit state; the CMS continues to use private Vercel Blob.

## Current rollout status

The source now uses sign-in pages only: HTTP Basic authentication and `ADMIN_AUTH_MODE` have been removed. Production activation is a separate step: configure the production schema, approved administrator and authentication environment before deploying these changes. The already-deployed website is unchanged.

## Local first login

With Docker running, execute `npm run local:setup`, then `npm run dev`. Open **http://localhost:3000/test/auth/login**. The first visit offers **Create your admin account** for `natinael.96@gmail.com`. Choose a new password privately to enter the admin immediately. QR setup is not required. Subsequent visits show normal sign-in.

The setup command removes obsolete `ADMIN_USER`/`ADMIN_PASSWORD` settings from `.env.local`, preserves unrelated settings and CMS content, and creates a persistent database in the Docker volume `stem-medica-local-auth-data`. The container `stem-medica-local-auth` binds PostgreSQL to loopback port 55440. Running the command again starts the same database; it does not reset accounts. Do not delete its volume or rotate `BETTER_AUTH_SECRET` casually: the secret is needed to decrypt authenticator data.

The first-account page and `/test/api/local-admin` require development mode, no Vercel environment, explicit `LOCAL_AUTH_SETUP=1`, a dedicated loopback database, a local canonical origin and a setup token. Creation is serialized under a database lock and closes once any account exists. Production returns 404 even if the flag is accidentally set. There is no public admin registration.

`127.0.0.1:3000` admin links redirect to the canonical `localhost:3000` origin, so cookies and origin checks agree. Use `npm run dev` (loopback-bound) for this local-only setup. Local accounts and CMS edits do not change production.

## Launch checklist

1. Open the Neon resource from the Vercel project's Storage/Integrations dashboard. Create an isolated development branch from production. Never use production credentials for automated tests.
2. Configure the test environment with that branch's pooled `DATABASE_URL` and direct `DATABASE_URL_UNPOOLED`. Keep credentials in private environment configuration, not source control or chat.
3. Set `BETTER_AUTH_SECRET` to a cryptographically random secret of at least 32 characters; retain it securely because it encrypts authenticator secrets. Set `BETTER_AUTH_URL` to the exact login origin, including scheme and port locally. Production requires HTTPS. Use one canonical hostname for admin pages and login; other hosts cannot submit authentication requests.
4. Set `ADMIN_EMAILS=natinael.96@gmail.com` for the real environment (use a disposable address for tests).
5. Review `drizzle/0000_hesitant_raider.sql`, then run `AUTH_MIGRATION_CONFIRM=apply npm run auth:migrate` against the development branch. The script requires the direct URL and rejects pooled hosts.
6. Create the approved account privately using the prompt below. Public registration is disabled. The script refuses to overwrite existing accounts.
7. Verify password-only login, optional QR enrollment, recovery codes, CMS access and logout in the isolated environment. After opting into two-factor authentication, password-only sessions must not reach admin pages or APIs. Keep `LOCAL_AUTH_SETUP` unset on all Vercel environments.
8. After the branch test succeeds, apply the reviewed migration to production, privately provision the real account, configure the production environment, and deploy. Verify the real administrator can enroll and sign in before considering the launch complete. Remove obsolete Basic credentials from Vercel after successful cutover.

The migration and provisioning scripts read the shell environment; they do not automatically load `.env.local`. Load the intended environment privately and verify the target before running them.

### Private account provisioning (Bash)

Do not put passwords in command arguments, shell history, screenshots or chat. With the intended database and auth environment already loaded:

```bash
export AUTH_CREATE_EMAIL=natinael.96@gmail.com
read -r -s -p 'New admin password (10–128 characters): ' STEM_ADMIN_PASSWORD
printf '\n'
printf '%s' "$STEM_ADMIN_PASSWORD" | npm run auth:create-admin
unset STEM_ADMIN_PASSWORD
```

Open `/test/auth/login` and sign in with email and password. To opt into extra protection, open Security, confirm the password and scan the QR code in an authenticator app. Save recovery codes, then verify the six-digit code. Until verification, enrollment is not enabled and password-only login remains available.

## Security behavior

- Admin pages and all CMS APIs independently check the database session and approved email. Accounts with two-factor enabled additionally require a session-specific MFA verification flag.
- Opting into two-factor authentication blocks older password-only sessions until the administrator signs in with a code.
- Sessions expire after eight hours without refresh; logout invalidates the server-side session.
- Login and verification have database-backed throttles. TOTP reuse is rejected; recovery codes are single-use. Trusted-device bypass and disabling two-factor authentication are not exposed.
- Authentication mutations require the configured origin. Cookies are HTTP-only, SameSite=Lax and Secure over HTTPS. CMS mutations retain their own origin checks.
- Basic credentials cannot grant access. Database/configuration failures deny access.
- No public password reset or email delivery is configured. Losing both authenticator access and recovery codes requires identity verification and a deliberate operator recovery procedure; no self-service reset UI is implemented yet.

TOTP reduces password-theft risk but is not phishing-resistant. Protect Vercel, Neon and the administrator's email account with their own MFA. Keep database credentials and encryption secrets backed up securely.

## Verification

`npm test` includes isolated PostgreSQL-compatible authentication tests, including stale sessions, replayed TOTP and recovery codes. Stop the normal dev server and run `npm run test:e2e:local` to test first-account creation, QR enrollment, recovery, CMS publishing, drafts, PDF export and mobile layouts. The runner uses a disposable database on port 55441 and a separate temporary CMS directory, then deletes only that run's data. Your real local account is not changed. Restart `npm run dev` afterwards.

Install Chromium with `npx playwright install chromium` or set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to your installed browser. Test credentials are dummy fixtures; never run browser tests against production. Auth traces and automatic screenshots are disabled to avoid recording QR/recovery secrets.
