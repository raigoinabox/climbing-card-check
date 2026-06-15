import { z } from "zod";
import { registerLegalConfirmations } from "#server/utils/exams_db";
import {
  getMontonioTokenMapper,
  REGISTRATION_FEE,
} from "#server/utils/montonio_service";
import { createUrl } from "../utils/urls_client";

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

  let exam;
  try {
    exam = await registerLegalConfirmations(body.examUuid);
  } catch (e) {
    if (e instanceof ValidationError) {
      throw createError({ statusCode: 400, message: e.message });
    }

    throw e;
  }

  if (process.env.MONTONIO_API_BASE == null) {
    throw createError("Montonio url is not configured");
  }

  const returnUrl = createUrl("/api/montonio_return");
  const token = getMontonioTokenMapper().create({
    merchantReference: body.examUuid,
    returnUrl,
    notificationUrl: createUrl("/api/montonio_notification"),
    grandTotal: REGISTRATION_FEE,
    currency: "EUR",
    payment: {
      amount: REGISTRATION_FEE,
      currency: "EUR",
      method: "paymentInitiation",
      methodOptions: { paymentDescription: `${exam.name} registritasu` },
    },
    locale: "et",
    billingAddress: {
      email: exam.email
    }
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
