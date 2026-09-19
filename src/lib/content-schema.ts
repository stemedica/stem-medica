import { pgTable, text, jsonb, timestamp, integer, index } from "drizzle-orm/pg-core";

// One atomic document per editor/draft, preserving existing optimistic concurrency.
export const contentDocuments = pgTable("content_document", {
  key: text("key").primaryKey(),
  data: jsonb("data").notNull(),
  revision: text("revision").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const enquiries = pgTable("enquiry", {
  id: text("id").primaryKey(),
  // "quotation" (hospital buying) or "partnership" (manufacturer offering to
  // distribute). Same pipeline, different intent, so the team can triage.
  kind: text("kind").notNull().default("quotation"),
  facility: text("facility").notNull(),
  contact: text("contact").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  equipment: text("equipment").notNull(),
  quantity: integer("quantity"),
  notes: text("notes"),
  status: text("status").notNull().default("new"),
  clientKey: text("client_key").notNull(),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [index("enquiry_created_at_idx").on(table.createdAt)]);

export const enquiryThrottle = pgTable("enquiry_throttle", {
  key: text("key").primaryKey(),
  count: integer("count").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});
