import jwt from "jsonwebtoken";
import { z } from "zod";
import { registerPayment, removePayment } from "./exams_db";

const responseSchema = z.object({
  accessKey: z.string(),
  merchantReference: z.string(),
  paymentStatus: z.literal([
    "PENDING",
    "PAID",
    "VOIDED",
    "PARTIALLY_REFUNDED",
    "REFUNDED",
    "ABANDONED",
  ]),
});

export function getMontonioTokenMapper() {
  const secretKey = process.env.MONTONIO_SECRET_KEY;
  const accessKey = process.env.MONTONIO_ACCESS_KEY;
  if (secretKey == null || accessKey == null) {
    throw createError("Montonio keys are not configured");
  }

  return {
    create(body: object) {
      return jwt.sign({ ...body, accessKey }, secretKey, {
        algorithm: "HS256",
        expiresIn: "1h",
      });
    },

    decode(token: string) {
      const decoded = responseSchema.parse(jwt.verify(token, secretKey));
      if (decoded.accessKey != accessKey) {
        throw createError("Montonio token has wrong accessKey");
      }
      return decoded;
    },
  };
}

export function handleMontonioEvent(orderToken: string) {
  const body = getMontonioTokenMapper().decode(orderToken);
  if (body.paymentStatus == "PAID") {
    registerPayment(body.merchantReference);
  } else if (body.paymentStatus != "PENDING") {
    console.log(
      "TODO saada kasutajale email, et me eemaldasime tema nimekirjast",
    );
    removePayment(body.merchantReference);
  }
}
