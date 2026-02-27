import { timingSafeEqual } from "crypto";
import { SheetModel } from "./sheet_model";

const usersModel = SheetModel.fixed("Instruktorite paroolid", [
  "name",
  "email",
  "password",
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
  const users = await usersModel.fetchData(
    (dto) =>
      dto.email != null &&
      isStringsConstantTimeEqual(dto.email, email) &&
      dto.password != null &&
      isStringsConstantTimeEqual(dto.password, password),
  );

  return users[0];
}
