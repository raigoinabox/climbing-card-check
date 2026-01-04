import type { IdCode } from "./climber_utils";
import { SheetModel } from "./sheet_model";

interface Card {
  updatedAt?: string;
  updatedBy?: string;
}

const cardsModel = SheetModel.fixed("Füüsilised kaardid", [
  "issuedCardId",
  "cardType",
  "climberId",
  "updatedAt",
  "updatedBy",
]);

export async function findCardByClimber(climberId: string) {
  const cards = await cardsModel.fetchData((dto) => dto.climberId == climberId);
  return cards.length == 0 ? null : cards[0];
}

export function findCardByCardOrClimber(cardId: string, climberId: IdCode) {
  return cardsModel.fetchData(
    (dto) => dto.issuedCardId == cardId || dto.climberId == climberId,
  );
}

export function saveCard(card: Card, userName: string) {
  card.updatedAt = new Date().toISOString();
  card.updatedBy = userName;
  return cardsModel.save(card);
}
