import { z } from "zod";
import { setSecurePassword } from "../utils/users_db";

const bodySchema = z.object({ newPassword: z.string() });

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, (body) => bodySchema.parse(body));
  const { user } = await requireUserSession(event);

  await setSecurePassword(user.email, body.newPassword);
});
