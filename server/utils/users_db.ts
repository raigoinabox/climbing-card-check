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

export async function getValidLoginUser(email: string, password: string) {
  const users = await usersModel.fetchData();

  for (const user of users) {
    const emailMatch =
      user.email != null && isStringsConstantTimeEqual(user.email, email);
    const passwordMatch =
      user.password != null &&
      isStringsConstantTimeEqual(user.password, password);
    const hashedPassword = user.hashedPassword;
    const hashedPasswordMatch =
      hashedPassword != null &&
      (await verifyPassword(hashedPassword, password));

    if (emailMatch && passwordMatch) {
      return { resetPassword: true, user };
    } else if (emailMatch && hashedPasswordMatch) {
      if (passwordNeedsReHash(hashedPassword)) {
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

export async function markUserForgotPassword(
  users: { email?: string; forgotPasswordAt?: string }[],
  email: string,
) {
  for (const user of users) {
    if (user.email == email) {
      user.forgotPasswordAt = getIsoNow();
      usersModel.save(user);
      return user;
    }
  }
}

export async function hashUserPassword(email: string, password: string) {
  const users = await usersModel.fetchData((user) => user.email == email);

  for (const user of users) {
    user.hashedPassword = await hashPassword(password);
    usersModel.save(user);
    return user;
  }
}

export async function setSecurePassword(email: string, password: string) {
  const users = await usersModel.fetchData((user) => user.email == email);

  for (const user of users) {
    user.password = "";
    user.hashedPassword = await hashPassword(password);
    usersModel.save(user);
    return user;
  }
}
