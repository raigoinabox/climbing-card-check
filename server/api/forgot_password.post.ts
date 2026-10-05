import { z } from "zod";
import { sendForgotPasswordEmail } from "../utils/email_service";
import { getAllUsers, markUserForgotPassword } from "../utils/users_db";
import { createJwt } from "../utils/jwt_service";
import { parseIsoDateTime } from "../utils/date_utils";

const bodySchema = z.object({ email: z.string() });

async function handleInAsync(email: string) {
  const users = await getAllUsers();
  const now = new Date();
  for (const user of users) {
    if (user.forgotPasswordAt != null) {
      const forgotPasswordAt = parseIsoDateTime(user.forgotPasswordAt);
      forgotPasswordAt.setUTCHours(forgotPasswordAt.getUTCHours() + 1);
      if (now < forgotPasswordAt) {
        console.log("Can't send email because sent one within an hour");
        return;
      }
    }
  }

  for (const user of users) {
    if (user.email == email) {
      if (user.forgotPasswordAt != null) {
        const forgotPasswordAt = parseIsoDateTime(user.forgotPasswordAt);
        forgotPasswordAt.setUTCHours(forgotPasswordAt.getUTCHours() + 12);
        if (now < forgotPasswordAt) {
          console.log(
            "Can't send email because sent to the user within 12 hours",
          );
          return;
        }
      }

      await sendForgotPasswordEmail(
        user.email,
        createJwt({ email: user.email }),
      );
      await markUserForgotPassword(user);
      return;
    }
  }

  console.log(`Didn't find an email to send to: ${email}`);
}

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, (body) => bodySchema.parse(body));

  event.waitUntil(handleInAsync(body.email));
  return {};
});
