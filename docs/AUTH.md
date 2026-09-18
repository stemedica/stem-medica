# Admin authentication

The admin uses a small first-party email/password system backed by Postgres. On Vercel, `DATABASE_URL` points to Neon. Passwords are hashed with Node's scrypt implementation, session tokens are random and only their SHA-256 digest is stored, and public registration is disabled.

Better Auth, QR authentication and recovery codes are not used.

## Environments

- Production uses the pooled Neon `DATABASE_URL` configured by the Vercel integration.
- `npm run dev` reads the isolated branch in `.env.neon-test` for both authentication and CMS content. Do not point this file at production.
- Automated browser tests create and dispose of their own Postgres container.

Use the pooled URL for application traffic. Use `DATABASE_URL_UNPOOLED` only for reviewed migrations, imports, dumps or restores.

## Production setup

1. Confirm the Vercel project has `DATABASE_URL` and `DATABASE_URL_UNPOOLED` from the intended Neon project.
2. Review `drizzle/0000_hesitant_raider.sql`, then run `AUTH_MIGRATION_CONFIRM=apply npm run auth:migrate` using the direct URL.
3. Create the administrator privately. Public signup does not exist.
4. Deploy, open `/auth/login`, and verify login, admin API access and logout.
5. Remove obsolete `ADMIN_USER`, `ADMIN_PASSWORD`, `BETTER_AUTH_URL` and `BETTER_AUTH_SECRET` variables from Vercel after the new login succeeds.

### Create an administrator

Never put a password in command arguments, source control, screenshots or chat.

```bash
export AUTH_CREATE_EMAIL=natinael.96@gmail.com
read -r -s -p 'New admin password (10–128 characters): ' STEM_ADMIN_PASSWORD
printf '\n'
printf '%s' "$STEM_ADMIN_PASSWORD" | npm run auth:create-admin
unset STEM_ADMIN_PASSWORD
```

The command refuses to overwrite an existing account.

### Reset a forgotten password

Run this only after verifying the administrator's identity. It changes the password, revokes every active session and removes any legacy QR-authentication state left by the previous implementation.

```bash
export AUTH_RESET_EMAIL=natinael.96@gmail.com
read -r -s -p 'Replacement password (10–128 characters): ' STEM_ADMIN_PASSWORD
printf '\n'
printf '%s' "$STEM_ADMIN_PASSWORD" | npm run auth:reset-password
unset STEM_ADMIN_PASSWORD
```

## Security behavior

- Passwords use scrypt with a unique 128-bit salt and constant-time comparison. Existing Better Auth scrypt hashes remain compatible.
- Sessions live for eight hours without refresh. The browser receives a random opaque token in an `HttpOnly`, `SameSite=Lax` cookie that is `Secure` in production; only its SHA-256 digest is stored in Postgres.
- Login attempts are limited in Postgres by both IP address and email address, so limits are shared across Vercel functions.
- Authentication mutations require a same-origin request. Admin pages and every admin API independently verify the database session.
- Invalid credentials use one generic response. Database or configuration failures deny access.
- Password reset is an operator command, not a public web endpoint.

## Verification

`npm test` covers password hashing, wrong-password handling, hashed sessions, logout and password-reset revocation using an isolated PostgreSQL-compatible database. `npm run test:e2e:local` verifies the browser login flow, red error state, API protection and logout using a disposable Postgres container. That disposable test database is the only local database path.
