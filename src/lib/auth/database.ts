import { Pool, type QueryResult, type QueryResultRow } from "pg";
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
    connectionTimeoutMillis: 15_000,
    query_timeout: 15_000,
    statement_timeout: 15_000,
    keepAlive: true,
  });
  if (process.env.VERCEL) attachDatabasePool(pool);
  return { pool, db: drizzle(pool, { schema }) };
}
export function authDatabase() { return database ??= connect(); }

/**
 * Neon suspends an idle compute, and waking it takes seconds. Without a retry
 * the first admin request after a quiet spell fails on connection timeout and
 * the whole admin renders an error page, which is what happened in testing.
 *
 * Mirrors the read retry in content-database.ts. Writes are not retried here:
 * a repeated INSERT is not always safe, and the caller can try again.
 */
const RETRY_DELAYS = [150, 1_200, 3_000];

function transient(error: unknown) {
  const failure = error as { code?: string; message?: string; cause?: { code?: string } };
  return [failure.code, failure.cause?.code].some((code) =>
    ["ETIMEDOUT", "ECONNRESET", "EPIPE", "57P01", "57P02", "57P03"].includes(code || ""))
    || /connection terminated|timeout|socket closed/i.test(failure.message || "");
}

/** A pool-shaped queryer that retries transient read failures. */
export function resilientQueryer(pool: Pool) {
  return {
    async query<R extends QueryResultRow = QueryResultRow>(text: string, values?: unknown[]): Promise<QueryResult<R>> {
      let lastError: unknown;
      for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt++) {
        try {
          return await pool.query<R>(text, values as never);
        } catch (error) {
          if (!transient(error)) throw error;
          lastError = error;
          const delay = RETRY_DELAYS[attempt];
          if (delay === undefined) break;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
      throw lastError;
    },
  };
}
