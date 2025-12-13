import { isLoginValid } from "../utils/users_db";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { email, password } = body;

  if (await isLoginValid(email, password)) {
    await setUserSession(
      event,
      { user: { name: email } },
      { maxAge: 12 * 60 * 60 },
    );
    return {};
  } else {
    throw createError({ statusCode: 401, message: "Bad credentials" });
  }
});
