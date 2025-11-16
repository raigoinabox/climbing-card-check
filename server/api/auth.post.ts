import { validate } from "../utils/_auth";

export default defineEventHandler(async (event) => {
  const { username, password } = await readBody(event);

  // Validate required fields
  if (!username || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: "Username and password required",
    });
  }

  if (!validate(username, password)) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid credentials",
    });
  }

  return {
    success: true,
    message: "Authentication successful",
    username: username,
  };
});
