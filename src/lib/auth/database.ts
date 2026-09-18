import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { attachDatabasePool } from "@vercel/functions";
import * as schema from "./schema";

let database: ReturnType<typeof connect> | undefined;
function connect() {
  if (!process.env.DATABASE_URL) throw new Error("Authentication database is not configured");
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 3,
    idleTimeoutMillis: 5_000,
    connectionTimeoutMillis: 10_000,
    query_timeout: 15_000,
    statement_timeout: 15_000,
    keepAlive: true,
  });
  if (process.env.VERCEL) attachDatabasePool(pool);
  return { pool, db: drizzle(pool, { schema }) };
}
export function authDatabase() { return database ??= connect(); }
