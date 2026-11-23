import { z } from "zod";
import { SheetModel } from "./sheet_model";

interface Card {
  updatedAt?: string;
  updatedBy?: string;
}

const cardsModel = SheetModel.fixed(
  "Füüsilised kaardid",
  ["issuedCardId", "cardType", "climberId", "updatedAt", "updatedBy"],
  z.object({
    issuedCardId: z.string().optional(),
    cardType: z.string().optional(),
    climberId: z.string().optional(),
    updatedAt: z.string().optional(),
    updatedBy: z.string().optional(),
  }),
);

export async function findCardByClimber(climberId: string) {
  const cards = await cardsModel.fetchData();

  for (const card of cards) {
    if (card.climberId == climberId) {
      return card;
    }
  }
}

export function findAllCards() {
  return cardsModel.fetchData();
}

export function saveCard(card: Card, userName: string) {
  card.updatedAt = new Date().toISOString();
  card.updatedBy = userName;
  return cardsModel.save(card);
}
