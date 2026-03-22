import { z } from "zod";
import { registerLegalConfirmations } from "#server/utils/exams_db";
import { getMontonioTokenMapper } from "#server/utils/montonio_service";

const schema = z.object({
  examUuid: z.string().min(1),
  confirmResponsibilityDeclaration: z.literal(true),
  confirmPrivacyPolicy: z.literal(true),
});

const montonioOrder = z.union([
  z.object({ paymentUrl: z.string() }),
  z.object({ message: z.string(), error: z.string(), statusCode: z.number() }),
]);

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

  if (process.env.MONTONIO_API_BASE == null || process.env.VERCEL_URL == null) {
    throw createError("Montonio urls are not configured");
  }

  const baseUrl = `https://${process.env.VERCEL_URL}/register_exam/climber-success`;
  const token = getMontonioTokenMapper().create({
    merchantReference: body.examUuid,
    returnUrl: baseUrl,
    notificationUrl: `${baseUrl}/api/montonio_notification`,
    grandTotal: 12,
    currency: "EUR",
    payment: { amount: 12, currency: "EUR", method: "paymentInitiation" },
    locale: "et",
  });

  const resp = await fetch(`${process.env.MONTONIO_API_BASE}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: token }),
  });

  const response = await resp.json();
  const result = montonioOrder.parse(response);
  if ("paymentUrl" in result) {
    return result.paymentUrl;
  } else if (result.message == "ALREADY_PAID_FOR") {
    throw createError({ statusCode: 400, statusMessage: "Juba on makstud" });
  } else {
    console.log(response);
    throw new Error(result.message);
  }
});
