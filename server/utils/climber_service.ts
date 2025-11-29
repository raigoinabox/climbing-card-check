import { Auth } from "googleapis";
import { findCardByClimber } from "./physical_cards_db";
import { type CheckDto } from "~/shared/types/api_types";

export const fetchClimberData = async (
  client: Auth.JWT,
  id: string,
): Promise<CheckDto> => {
  try {
    const result = await findById(client, id);
    const card = await findCardByClimber(client, result.id);

    return {
      success: true,
      cardSerialId: card?.issuedCardId,
      ...result,
    };
  } catch (err) {
    let message = undefined;
    if (typeof err == "object" && err != null && "message" in err) {
      message = err.message;
    }
    return {
      id,
      success: false,
      message,
    };
  }
};

export function isIdCodeValid(code: string) {
  if (code.length !== 11) {
    return false;
  }

  const nr = [];
  for (let i = 0; i < code.length && i < 10; i++) {
    nr.push(parseInt(code[i]!, 10));
  }
  const givenControlCode = parseInt(code[10]!, 10);

  if (nr.some(Number.isNaN)) {
    return false;
  }

  const controlCode =
    nr.reduce((acc, value, index) => acc + value * ((index % 9) + 1), 0) % 11;

  if (controlCode !== 10) {
    return givenControlCode === controlCode;
  }

  const controlCode2 =
    nr.reduce((acc, value, index) => acc + value * (((index + 2) % 9) + 1), 0) %
    11;

  return givenControlCode === controlCode2;
}
