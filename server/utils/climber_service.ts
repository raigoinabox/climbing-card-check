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
