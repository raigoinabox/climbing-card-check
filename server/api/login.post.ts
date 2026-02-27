import { getValidLoginUser } from "../utils/users_db";
import { z } from "zod";

const bodySchema = z.object({ email: z.string(), password: z.string() });

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, (body) => bodySchema.parse(body));

  const user = await getValidLoginUser(body.email, body.password);
  if (user != null) {
    await setUserSession(
      event,
      { user: { name: user.name, email: user.email } },
      { maxAge: 12 * 60 * 60 },
    );
    return {};
  } else {
    throw createError({ statusCode: 401, message: "Bad credentials" });
  }
});
