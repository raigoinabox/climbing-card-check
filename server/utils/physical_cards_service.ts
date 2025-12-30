import { createError } from "#imports";
import type { IdCode } from "./climber_utils";
import { findCardByCardOrClimber, saveCard } from "./physical_cards_db";
import { findExamById } from "./exams_db";

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
      if (card.climberId != null) {
        throw createError({
          status: 400,
          data: "Kaart on juba ronijaga seotud",
        });
      }

      const exam = await findExamById(climberId);
      if (exam.certificate != card.cardType) {
        throw createError({
          status: 400,
          data: "Kaart on valet tüüpi (roheline/punane)",
        });
      }

      card.climberId = climberId;
      await saveCard(card, userName);
      cardAdded = true;
    } else if (card.climberId == climberId) {
      // delay it so that that insert errors surface before destructive operations
      removeCards.push(card);
    }
  }

  if (!cardAdded) {
    // no card found
    throw createError({
      statusCode: 400,
      data: "Sellise seeriakoodiga kaarti ei ole",
    });
  }

  for (const card of removeCards) {
    card.climberId = "";
    await saveCard(card, userName);
  }
}
