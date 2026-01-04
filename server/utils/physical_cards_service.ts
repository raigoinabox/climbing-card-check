import type { IdCode } from "./climber_utils";
import { findCardByCardOrClimber, saveCard } from "./physical_cards_db";
import { findExamById } from "./exams_db";

export class ValidationError extends Error {
  static validate(check: boolean, message: string) {
    if (!check) {
      throw new ValidationError(message);
    }
  }
}

export async function insertPhysicalCard(
  climberId: IdCode,
  cardId: string,
  userName: string,
) {
  const cards = await findCardByCardOrClimber(cardId, climberId);
  const removeCards = [];
  let cardAdded = false;
  for (const card of cards) {
    if (card.issuedCardId == cardId) {
      ValidationError.validate(
        card.climberId == null,
        "Kaart on juba ronijaga seotud",
      );

      const exam = await findExamById(climberId);
      ValidationError.validate(
        exam.certificate == card.cardType,
        "Kaart on valet tüüpi (roheline/punane)",
      );

      card.climberId = climberId;
      await saveCard(card, userName);
      cardAdded = true;
    } else if (card.climberId == climberId) {
      // delay it so that that insert errors surface before destructive operations
      removeCards.push(card);
    }
  }

  // no card found
  ValidationError.validate(cardAdded, "Sellise seeriakoodiga kaarti ei ole");

  for (const card of removeCards) {
    card.climberId = "";
    await saveCard(card, userName);
  }
}
