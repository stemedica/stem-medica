import { get, put, list, del, BlobPreconditionFailedError } from "@vercel/blob";
import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile, rename, unlink, readdir, stat } from "node:fs/promises";
import path from "node:path";

export class ConflictError extends Error {}
export class StorageUnavailable extends Error {}
const local = () => process.env.STORAGE_DRIVER === "local" && !process.env.VERCEL;
const postgres = () => process.env.CONTENT_STORAGE_DRIVER === "postgres";
const contentKey = (key: string) => /^(catalogue\/|posts\/|drafts\/)/.test(key);
export function contentStorageIdentity() {
  if (!postgres()) return process.env.STORAGE_DRIVER ?? "blob";
  const url = process.env.CMS_DATABASE_URL || process.env.DATABASE_URL || "";
  return "postgres:" + createHash("sha256").update(url).digest("hex");
}
// Runtime-only development data must never be traced into a deployment bundle.
const root = () => path.resolve(/* turbopackIgnore: true */ process.env.LOCAL_STORAGE_DIR || ".local-storage");
export function storageReady() {
  return postgres() ? !!(process.env.CMS_DATABASE_URL || process.env.DATABASE_URL) : local() || !!(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}
function checkKey(key: string) {
  if (!/^[a-zA-Z0-9/_.-]+$/.test(key) || key.includes("..") || key.startsWith("/")) throw new Error("Invalid storage key");
  const ready = postgres() && contentKey(key) ? storageReady() : local() || !!(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
  if (!ready) throw new StorageUnavailable("Storage is not configured for this content.");
}
const etagFor = (data: Buffer) => createHash("sha256").update(data).digest("hex");
export async function readObject(key: string): Promise<{ bytes: Buffer; etag: string } | null> {
  checkKey(key);
  if (postgres() && contentKey(key)) return (await import("./content-database")).readDocument(key);
  if (local()) {
    try { const bytes = await readFile(/* turbopackIgnore: true */ path.join(/* turbopackIgnore: true */ root(), key)); return { bytes, etag: etagFor(bytes) }; }
    catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return null; throw error; }
  }
  const result = await get(key, { access: "private", useCache: false });
  if (!result) return null;
  if (result.statusCode !== 200) throw new Error("Unexpected storage response");
  return { bytes: Buffer.from(await new Response(result.stream).arrayBuffer()), etag: result.blob.etag };
}
// expected=null creates only; a string is a compare-and-swap update.
export async function writeObject(key: string, bytes: Buffer, contentType: string, expected: string | null = null) {
  checkKey(key);
  if (postgres() && contentKey(key)) {
    if (contentType !== "application/json") throw new Error("Database content must be JSON");
    const revision = await (await import("./content-database")).writeDocument(key, JSON.parse(bytes.toString("utf8")), expected);
    if (!revision) throw new ConflictError("This content changed in another tab. Reload before saving.");
    return revision;
  }
  if (local()) {
    const filename = path.join(/* turbopackIgnore: true */ root(), key);
    await mkdir(path.dirname(filename), { recursive: true });
    const lock = `${filename}.lock`;
    try { await mkdir(lock); } catch { throw new ConflictError("Another save is in progress. Try again."); }
    const temp = `${filename}.${randomUUID()}.tmp`;
    try {
      const previous = await readObject(key);
      if ((previous?.etag ?? null) !== expected) throw new ConflictError("This content changed in another tab. Reload before saving.");
      await writeFile(temp, bytes);
      await rename(temp, filename);
      return etagFor(bytes);
    } finally {
      await unlink(temp).catch(() => {});
      const { rmdir } = await import("node:fs/promises");
      await rmdir(lock);
    }
  }
  try {
    const result = await put(key, bytes, { access: "private", addRandomSuffix: false, contentType,
      ...(expected ? { ifMatch: expected } : { allowOverwrite: false }),
    });
    return result.etag;
  } catch (error) {
    if (error instanceof BlobPreconditionFailedError || (error instanceof Error && /already exists/i.test(error.message))) throw new ConflictError("This content changed in another tab. Reload before saving.");
    throw error;
  }
}
export async function readJson<T>(key: string) {
  const result = await readObject(key);
  return result ? { data: JSON.parse(result.bytes.toString("utf8")) as T, etag: result.etag } : null;
}
/**
 * Whole-collection documents are read and rewritten in full, so their size is
 * the real limit on this storage model, not any per-field cap. Field limits
 * alone multiply out to something this pattern cannot carry, so the invariant
 * is enforced here, at the one write path, in bytes.
 *
 * Raising this is a decision to move that collection to per-row storage, not a
 * number to nudge. See docs/STORAGE.md.
 */
export const CONTENT_DOCUMENT_MAX_BYTES = 1_000_000;

export class ContentTooLarge extends Error {}

export const writeJson = (key: string, data: unknown, expected: string | null = null) => {
  const bytes = Buffer.from(JSON.stringify(data));
  if (contentKey(key) && bytes.byteLength > CONTENT_DOCUMENT_MAX_BYTES) {
    throw new ContentTooLarge(
      `This collection is ${Math.round(bytes.byteLength / 1024)} KB, over the ${Math.round(CONTENT_DOCUMENT_MAX_BYTES / 1024)} KB limit. Remove or shorten entries, or move this collection to per-row storage.`,
    );
  }
  return writeObject(key, bytes, "application/json", expected);
};

export async function listObjects(prefix: string) {
  checkKey(prefix);
  if (postgres() && contentKey(prefix)) return (await import("./content-database")).listDocuments(prefix);
  if (local()) {
    const directory = path.join(/* turbopackIgnore: true */ root(), prefix);
    try {
      const names = await readdir(/* turbopackIgnore: true */ directory);
      return (await Promise.all(names.filter((n) => !n.endsWith(".lock") && !n.endsWith(".tmp")).map(async (name) => {
        const info = await stat(/* turbopackIgnore: true */ path.join(/* turbopackIgnore: true */ directory, name));
        return { pathname: `${prefix}${name}`, uploadedAt: info.mtime };
      })));
    } catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return []; throw error; }
  }
  const objects: { pathname: string; uploadedAt: Date }[] = [];
  let cursor: string | undefined;
  do { const page = await list({ prefix, cursor, limit: 1000 }); objects.push(...page.blobs); cursor = page.hasMore ? page.cursor : undefined; } while (cursor);
  return objects;
}
export async function deleteObject(key: string, etag: string) {
  checkKey(key);
  if (postgres() && contentKey(key)) {
    if (!await (await import("./content-database")).deleteDocument(key, etag)) throw new ConflictError("Content changed");
    return;
  }
  if (local()) {
    const filename = path.join(/* turbopackIgnore: true */ root(), key);
    try { await mkdir(`${filename}.lock`); } catch { throw new ConflictError("Another operation is in progress"); }
    try {
      const current = await readObject(key);
      if (current?.etag !== etag) throw new ConflictError("Content changed");
      await unlink(filename);
    } finally { const { rmdir } = await import("node:fs/promises"); await rmdir(`${filename}.lock`); }
  } else await del(key, { ifMatch: etag });
}
