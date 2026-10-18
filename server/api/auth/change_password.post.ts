import { z } from "zod";
import { changePassword } from "../../utils/users_db";

const bodySchema = z.object({
  oldPassword: z.string(),
  newPassword: z.string().min(15),
});

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, (body) => bodySchema.parse(body));
  const { user } = await requireUserSession(event);

  await changePassword(user.email, body.oldPassword, body.newPassword);
});
