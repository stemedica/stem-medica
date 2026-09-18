import { pgTable, text, boolean, timestamp, integer, bigint, index } from "drizzle-orm/pg-core";

const dates = () => ({ createdAt: timestamp("createdAt").notNull().defaultNow(), updatedAt: timestamp("updatedAt").notNull().defaultNow() });
export const user = pgTable("auth_user", {
  id: text("id").primaryKey(), name: text("name").notNull(), email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false), image: text("image"),
  twoFactorEnabled: boolean("twoFactorEnabled").default(false), ...dates(),
});
export const session = pgTable("auth_session", {
  id: text("id").primaryKey(), token: text("token").notNull().unique(), expiresAt: timestamp("expiresAt").notNull(),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
  ipAddress: text("ipAddress"), userAgent: text("userAgent"), mfaVerified: boolean("mfaVerified").notNull().default(false), ...dates(),
}, (table) => [index("auth_session_user_idx").on(table.userId)]);
export const account = pgTable("auth_account", {
  id: text("id").primaryKey(), accountId: text("accountId").notNull(), providerId: text("providerId").notNull(),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }), password: text("password"),
  accessToken: text("accessToken"), refreshToken: text("refreshToken"), idToken: text("idToken"), scope: text("scope"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"), refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"), ...dates(),
}, (table) => [index("auth_account_user_idx").on(table.userId)]);
// Legacy columns/tables remain in the migration so existing password hashes carry over safely.
// The first-party runtime uses only auth_user, credential auth_account rows, auth_session and auth_throttle.
export const verification = pgTable("auth_verification", {
  id: text("id").primaryKey(), identifier: text("identifier").notNull(), value: text("value").notNull(), expiresAt: timestamp("expiresAt").notNull(), ...dates(),
}, (table) => [index("auth_verification_identifier_idx").on(table.identifier)]);
export const twoFactor = pgTable("auth_two_factor", {
  id: text("id").primaryKey(), secret: text("secret").notNull(), backupCodes: text("backupCodes").notNull(),
  userId: text("userId").notNull().unique().references(() => user.id, { onDelete: "cascade" }),
  verified: boolean("verified").default(true), failedVerificationCount: integer("failedVerificationCount").default(0), lockedUntil: timestamp("lockedUntil"),
});
export const rateLimit = pgTable("auth_rate_limit", {
  id: text("id").primaryKey(), key: text("key").notNull().unique(), count: integer("count").notNull(), lastRequest: bigint("lastRequest", { mode: "number" }).notNull(),
});
// Atomic shared counters and short-lived one-time-code replay protection.
export const throttle = pgTable("auth_throttle", { key: text("key").primaryKey(), count: integer("count").notNull(), expiresAt: timestamp("expiresAt").notNull() });
export const otpUse = pgTable("auth_otp_use", { key: text("key").primaryKey(), expiresAt: timestamp("expiresAt").notNull() });
