import { timingSafeEqual } from "crypto";
import { SheetModel } from "./sheet_model";
import { getIsoNow } from "./date_utils";

const usersModel = SheetModel.fixed("Instruktorite paroolid", [
  "name",
  "email",
  "password",
  "hashedPassword",
  "forgotPasswordAt",
]);

function isStringsConstantTimeEqual(a: string, b: string) {
  try {
    return timingSafeEqual(Buffer.from(a, "utf8"), Buffer.from(b, "utf8"));
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return false;
  }
}

async function isValidUser(
  user: { email?: string; password?: string; hashedPassword?: string },
  email: string,
  password: string,
) {
  const emailMatch =
    user.email != null && isStringsConstantTimeEqual(user.email, email);
  const passwordMatch =
    user.password != null &&
    isStringsConstantTimeEqual(user.password, password);
  const hashedPassword = user.hashedPassword;
  const hashedPasswordMatch =
    hashedPassword != null && (await verifyPassword(hashedPassword, password));
  return {
    passwordMatch: emailMatch && passwordMatch,
    hashedPasswordMatch: emailMatch && hashedPasswordMatch,
  };
}

export async function getValidLoginUser(email: string, password: string) {
  const users = await usersModel.fetchData();

  for (const user of users) {
    const { passwordMatch, hashedPasswordMatch } = await isValidUser(
      user,
      email,
      password,
    );

    if (passwordMatch) {
      return { resetPassword: true, user };
    } else if (hashedPasswordMatch) {
      if (
        user.hashedPassword != null &&
        passwordNeedsReHash(user.hashedPassword)
      ) {
        user.hashedPassword = await hashPassword(password);
        await usersModel.save(user);
      }

      return { user };
    }
  }
}

export async function getAllUsers() {
  return usersModel.fetchData();
}

export async function markUserForgotPassword(user: {
  email?: string;
  forgotPasswordAt?: string;
}) {
  user.forgotPasswordAt = getIsoNow();
  usersModel.save(user);
}

export async function hashUserPassword(email: string, password: string) {
  const users = await usersModel.fetchData((user) => user.email == email);

  for (const user of users) {
    user.hashedPassword = await hashPassword(password);
    usersModel.save(user);
    return user;
  }
}

export async function changePassword(
  email: string,
  oldPassword: string,
  newPassword: string,
) {
  const users = await usersModel.fetchData((user) => user.email == email);

  for (const user of users) {
    const { passwordMatch, hashedPasswordMatch } = await isValidUser(
      user,
      email,
      oldPassword,
    );
    if (passwordMatch || hashedPasswordMatch) {
      user.password = "";
      user.hashedPassword = await hashPassword(newPassword);
      usersModel.save(user);
      return;
    }
  }

  throw createError({
    statusCode: 401,
    data: {
      title: "Parooli vahetamine ebaõnnestus",
      description: "Vale vana parool",
    },
  });
}
