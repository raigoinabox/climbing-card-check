import jwt from "jsonwebtoken";

interface Payload {
  email: string;
}

function getSecretKey() {
  const secretKey = process.env.JWT_SECRET_KEY;
  if (secretKey == null) {
    throw createError("Jwt key is not configured");
  }

  return Buffer.from(secretKey, "base64");
}

export function createJwt(payload: Payload) {
  return jwt.sign(payload, getSecretKey(), { expiresIn: "1h" });
}

export function verifyJwt(token: string): Payload {
  return jwt.verify(token, getSecretKey()) as Payload;
}
