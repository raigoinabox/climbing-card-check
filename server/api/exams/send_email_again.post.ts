import { sendRegistrationEmail } from "#server/utils/email_service";
import { z } from "zod";

const bodySchema = z.object({ uuid: z.string() });

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, (body) => bodySchema.parse(body));
  const { user } = await requireUserSession(event);

  sendRegistrationEmail(user.email, body.uuid);
});
