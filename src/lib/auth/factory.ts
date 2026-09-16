import { betterAuth, type BetterAuthOptions } from "better-auth";
import { twoFactor } from "better-auth/plugins";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { approvedAdmin } from "./policy";

export function createAdminAuth(options: {
  database: BetterAuthOptions["database"]; secret: string; baseURL: string; adminEmails: string;
  consumeTotp: (userId: string, code: string) => Promise<boolean>;
  bootstrap?: boolean;
}) {
  return betterAuth({
    appName: "STEM MEDICA Admin", baseURL: options.baseURL, secret: options.secret, database: options.database,
    trustedOrigins: [new URL(options.baseURL).origin],
    emailAndPassword: { enabled: true, disableSignUp: !options.bootstrap, minPasswordLength: 10, maxPasswordLength: 128, autoSignIn: false },
    session: {
      expiresIn: 60 * 60 * 8, disableSessionRefresh: true, cookieCache: { enabled: false },
      additionalFields: { mfaVerified: { type: "boolean", defaultValue: false, input: false } },
    },
    advanced: {
      useSecureCookies: options.baseURL.startsWith("https:"),
      defaultCookieAttributes: { httpOnly: true, sameSite: "lax" },
      ipAddress: { ipAddressHeaders: process.env.VERCEL ? ["x-vercel-forwarded-for"] : ["x-forwarded-for"] },
    },
    rateLimit: { enabled: true, storage: "database", window: 60, max: 60,
      customRules: { "/sign-in/email": { window: 60, max: 5 }, "/two-factor/*": { window: 60, max: 8 } } },
    plugins: [twoFactor({ issuer: "STEM MEDICA", twoFactorCookieMaxAge: 300, accountLockout: { enabled: true, maxFailedAttempts: 5, durationSeconds: 900 } })],
    databaseHooks: {
      user: { create: { before: async (value) => {
        if (!approvedAdmin(value.email, options.adminEmails)) throw new APIError("FORBIDDEN", { message: "Account is not approved." });
        return { data: value };
      } } },
      session: { create: { before: async (value) => ({ data: { ...value, mfaVerified: false } }) } },
    },
    hooks: {
      before: createAuthMiddleware(async (ctx) => {
        if (ctx.body?.trustDevice) throw new APIError("FORBIDDEN", { message: "Authenticator verification is required on every sign-in." });
        if (ctx.path === "/two-factor/disable") throw new APIError("FORBIDDEN", { message: "Two-factor authentication is required. Contact the site owner for recovery." });
        if (ctx.path === "/sign-in/email" && !approvedAdmin(String(ctx.body?.email ?? ""), options.adminEmails)) throw new APIError("UNAUTHORIZED", { message: "Invalid email or password." });
      }),
      after: createAuthMiddleware(async (ctx) => {
        if (!["/two-factor/verify-totp", "/two-factor/verify-backup-code"].includes(ctx.path)) return;
        const result = ctx.context.returned;
        if (!result || result instanceof APIError || typeof result !== "object" || !("token" in result) || !result.token) return;
        const verified = ctx.context.newSession ?? ctx.context.session;
        if (!verified) return;
        const token = verified.session.token;
        if (ctx.path === "/two-factor/verify-totp" && !await options.consumeTotp(verified.user.id, String(ctx.body?.code))) {
          await ctx.context.internalAdapter.deleteSession(token);
          throw new APIError("UNAUTHORIZED", { message: "Code already used. Wait for a new code and sign in again." });
        }
        await ctx.context.internalAdapter.updateSession(token, { mfaVerified: true });
      }),
    },
  });
}
