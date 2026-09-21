import { z } from "zod";
import { sendForgotPasswordEmail } from "../utils/email_service";
import { getAllUsers, markUserForgotPassword } from "../utils/users_db";
import { createJwt } from "../utils/jwt_service";
import { formatIsoDateTime, parseIsoDateTime } from "../utils/date_utils";

const bodySchema = z.object({ email: z.string() });

async function handleInAsync(users: { email?: string }[], email: string) {
  const user = await markUserForgotPassword(users, email);
  if (user != null && user.email != null) {
    await sendForgotPasswordEmail(user.email, createJwt({ email: user.email }));
  }
}

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, (body) => bodySchema.parse(body));

  const users = await getAllUsers();
  const limitTime = new Date();
  limitTime.setUTCHours(limitTime.getUTCHours() - 8);
  for (const user of users) {
    if (user.forgotPasswordAt != null) {
      const forgotPasswordAt = parseIsoDateTime(user.forgotPasswordAt);
      if (limitTime < forgotPasswordAt) {
        forgotPasswordAt.setUTCHours(forgotPasswordAt.getUTCHours() + 8);
        throw createError({
          statusCode: 429,
          data: { retryAfter: formatIsoDateTime(forgotPasswordAt) },
        });
      }
    }
  }

  event.waitUntil(handleInAsync(users, body.email));
  return {};
});
