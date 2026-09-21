import { hashUserPassword } from "../utils/users_db";
import { z } from "zod";
import { verifyJwt } from "../utils/jwt_service";
import jwt from "jsonwebtoken";

const bodySchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(14),
  passwordRepeat: z.string().min(14),
});

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, (body) => bodySchema.parse(body));
  try {
    const { email } = verifyJwt(body.token);

    if (body.newPassword != body.passwordRepeat) {
      throw createError({ statusCode: 400, message: "Paroolid ei ühti" });
    }

    const user = await hashUserPassword(email, body.newPassword);
    if (user) {
      await setUserSession(
        event,
        { user: { name: user.name, email: user.email } },
        { maxAge: 12 * 60 * 60 },
      );
    }

    return {};
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw createError({
        statusCode: 400,
        message: "Link on kehtivuse kaotanud",
      });
    } else {
      throw error;
    }
  }
});
