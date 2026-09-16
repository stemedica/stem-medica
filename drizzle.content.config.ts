import { defineConfig } from "drizzle-kit";
export default defineConfig({ schema: "./src/lib/content-schema.ts", out: "./drizzle-content", dialect: "postgresql" });
