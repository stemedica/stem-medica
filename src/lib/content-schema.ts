import { pgTable, text, jsonb, timestamp } from "drizzle-orm/pg-core";

// One atomic document per editor/draft, preserving existing optimistic concurrency.
export const contentDocuments = pgTable("content_document", {
  key: text("key").primaryKey(),
  data: jsonb("data").notNull(),
  revision: text("revision").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
