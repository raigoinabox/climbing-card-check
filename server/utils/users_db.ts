import { Auth } from "googleapis";
import { timingSafeEqual } from "crypto";

const usersModel = SheetModel.fixed("Instruktorite paroolid", [
  "name",
  "email",
  "password",
]);

function isStringsConstantTimeEqual(a: string, b: string) {
  try {
    return timingSafeEqual(Buffer.from(a, "utf8"), Buffer.from(b, "utf8"));
  } catch (e) {
    return false;
  }
}

export async function isLoginValid(email: string, password: string) {
  return (
    (
      await usersModel.fetchData(
        (dto) =>
          dto.email != null &&
          isStringsConstantTimeEqual(dto.email, email) &&
          dto.password != null &&
          isStringsConstantTimeEqual(dto.password, password),
      )
    ).length > 0
  );
}
