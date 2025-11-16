import assert from "node:assert";
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import process from "node:process";
import { promisify } from "node:util";

export const ENC = "base64url";
const KEYLEN = 32;

const parsedAuthUsers: [string, string, string, string][] = JSON.parse(
  process.env.AUTH_USERS ?? "[]",
);
const validUsers = parsedAuthUsers.map(([name, email, salt, hash]) => {
  return {
    name,
    email: email.toLowerCase(),
    salt: Buffer.from(salt, ENC),
    hash: Buffer.from(hash, ENC),
  };
});

assert(Array.isArray(validUsers));

if (validUsers.length === 0) {
  console.warn("No users configured");
}

export const genHash = async (password: string) => {
  const salt = randomBytes(3);
  const hash = await deriveHash(salt, password);
  return {
    salt: salt.toString(ENC),
    hash: hash.toString(ENC),
  };
};

export const deriveHash = (
  salt: Buffer<ArrayBuffer>,
  password: string,
): Promise<Buffer<ArrayBuffer>> => {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, KEYLEN, (error, derivedKey) => {
      if (error != null) {
        reject(error);
      } else {
        resolve(derivedKey);
      }
    });
  });
};

const compare = async (
  salt: Buffer<ArrayBuffer>,
  hash: Buffer<ArrayBuffer>,
  password: string,
) => {
  const derivedHash = await deriveHash(salt, password);
  return timingSafeEqual(hash, derivedHash);
};

export const validate = async (email: string, password: string) => {
  email = email.toLowerCase();

  if (typeof email !== "string" || !email.length) {
    return false;
  }

  if (typeof password !== "string" || !password.length) {
    return false;
  }

  for (const compared of validUsers) {
    if (compared.email !== email) {
      continue;
    }
    const result = await compare(compared.salt, compared.hash, password);
    if (result) {
      return compared;
    }
    return result;
  }

  return null;
};
