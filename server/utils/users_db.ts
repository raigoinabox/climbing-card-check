import { timingSafeEqual } from "crypto";
import { SheetModel } from "./sheet_model";

const usersModel = SheetModel.fixed("Instruktorite paroolid", [
  "name",
  "email",
  "password",
  "hashedPassword",
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
      user.hashedPassword = await hashPassword(password);
      user.password = "";
      await usersModel.save(user);
      return user;
    } else if (emailMatch && hashedPasswordMatch) {
      if (user.password != null) {
        user.password = "";
        await usersModel.save(user);
      }
      if (passwordNeedsReHash(hashedPassword)) {
        user.hashedPassword = await hashPassword(password);
        await usersModel.save(user);
      }

      return user;
    }
  }

  return null;
}
