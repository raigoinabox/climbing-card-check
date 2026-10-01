import { getValidLoginUser } from "../utils/users_db";
import { z } from "zod";

const bodySchema = z.object({ email: z.string(), password: z.string() });

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, (body) => bodySchema.parse(body));

  const login = await getValidLoginUser(body.email, body.password);
  if (login != null) {
    await setUserSession(
      event,
      { user: { name: login.user.name, email: login.user.email } },
      { maxAge: 12 * 60 * 60 },
    );
    return { resetPassword: login.resetPassword };
  } else {
    throw createError({
      statusCode: 401,
      data: {
        title: "Sisselogimine ebaõnnestus",
        description: "Vale kasutajanimi või parool",
      },
    });
  }
});
