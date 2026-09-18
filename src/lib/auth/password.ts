import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const parameters = { N: 16_384, r: 16, p: 1, dkLen: 64 } as const;

function derive(password: string, salt: string) {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(password.normalize("NFKC"), salt, parameters.dkLen, {
      N: parameters.N, r: parameters.r, p: parameters.p,
      maxmem: 128 * parameters.N * parameters.r * 2,
    }, (error, key) => error ? reject(error) : resolve(key));
  });
}

export async function hashPassword(password: string) {
  if (password.length < 10 || password.length > 128) throw new Error("Password must be 10–128 characters");
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${(await derive(password, salt)).toString("hex")}`;
}

export async function verifyPassword(hash: string, password: string) {
  const [salt, encoded, extra] = hash.split(":");
  if (!salt || !encoded || extra || !/^[a-f0-9]{32}$/i.test(salt) || !/^[a-f0-9]{128}$/i.test(encoded)) return false;
  const expected = Buffer.from(encoded, "hex");
  const actual = await derive(password, salt);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
