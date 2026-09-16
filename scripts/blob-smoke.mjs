import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { get, put, del, BlobPreconditionFailedError } from "@vercel/blob";

// Only a unique test object is changed. Never reads or mutates catalogue/draft data.
const key = `checks/${randomUUID()}.json`;
let etag;
try {
  const initial = await put(key, JSON.stringify({ check: 1 }), { access: "private", addRandomSuffix: false, contentType: "application/json" });
  etag = initial.etag;
  const read = await get(key, { access: "private", useCache: false });
  assert.equal(read?.statusCode, 200);
  assert.deepEqual(await new Response(read.stream).json(), { check: 1 });
  const updated = await put(key, JSON.stringify({ check: 2 }), { access: "private", addRandomSuffix: false, contentType: "application/json", ifMatch: initial.etag });
  etag = updated.etag;
  await assert.rejects(put(key, "{}", { access: "private", addRandomSuffix: false, ifMatch: initial.etag }), BlobPreconditionFailedError);
  const privateResponse = await fetch(initial.url);
  assert.notEqual(privateResponse.status, 200);
  console.log("Private Blob read/write, conditional-write conflict and anonymous-access checks passed.");
} finally {
  if (etag) { await del(key, { ifMatch: etag }); console.log("Temporary test object deleted."); }
}
