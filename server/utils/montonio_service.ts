import jwt from "jsonwebtoken";
import { z } from "zod";
import { registerPayment, removePayment } from "./exams_db";
import { sendRejectionEmail } from "./email_service";

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

export const REGISTRATION_FEE = 12;

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
        // in case of errors Montonio will retry the webhook for 48 hours
        expiresIn: "50h",
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

export async function handleMontonioEvent(orderToken: string) {
  console.log("handleMontonioEvent", orderToken);
  const body = getMontonioTokenMapper().decode(orderToken);
  if (body.paymentStatus == "PAID") {
    registerPayment(body.merchantReference);
  } else if (body.paymentStatus != "PENDING") {
    const exam = await removePayment(body.merchantReference);
    if (!exam.email) {
      throw new ValidationError("Eksamist on emaili aadress puudu");
    }

    await sendRejectionEmail(exam.email);
  }
}
