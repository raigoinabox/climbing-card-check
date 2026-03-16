import { z } from "zod";
import { registerLegalConfirmations } from "../utils/exams_db";
import jwt from "jsonwebtoken";

const schema = z.object({
  examUuid: z.string().min(1),
  confirmResponsibilityDeclaration: z.literal(true),
  confirmPrivacyPolicy: z.literal(true),
});

const montonioOrder = z.object({ paymentUrl: z.string() });

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, (body) => schema.parse(body));

  try {
    await registerLegalConfirmations(body.examUuid);
  } catch (e) {
    if (e instanceof ValidationError) {
      throw createError({ statusCode: 400, message: e.message });
    }

    throw e;
  }

  if (
    process.env.MONTONIO_SECRET_KEY == null ||
    process.env.MONTONIO_ACCESS_KEY == null ||
    process.env.MONTONIO_API_BASE == null ||
    process.env.VERCEL_URL == null
  ) {
    throw createError("Montonio secret key is not configured");
  }

  const baseUrl = `https://${process.env.VERCEL_URL}`;
  const token = jwt.sign(
    {
      accessKey: process.env.MONTONIO_ACCESS_KEY,
      merchantReference: body.examUuid,
      returnUrl: baseUrl,
      notificationUrl: `${baseUrl}/api/montonio_notification`,
      grandTotal: 0.1,
      currency: "EUR",
      payment: { amount: 0.1, currency: "EUR", method: "paymentInitiation" },
      locale: "et",
    },
    process.env.MONTONIO_SECRET_KEY,
    { algorithm: "HS256", expiresIn: "1h" },
  );
  const resp = await fetch(`${process.env.MONTONIO_API_BASE}/orders`, {
    method: "POST",
    body: token,
    headers: { Authorization: `Bearer ${token}` },
  });

  const rawJson = await resp.json();
  console.log(rawJson);
  const result = montonioOrder.parse(rawJson);
  return result.paymentUrl;
});
