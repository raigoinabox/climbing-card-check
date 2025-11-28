import { Auth } from "googleapis";

const cardsModel = new SheetModel("Füüsilised kaardid", [
  "createdAt",
  "climberId",
  "issuedCardId",
]);

export async function findCardByClimber(client: Auth.JWT, climberId: string) {
  const cards = await cardsModel.fetchData(
    client,
    (dto) => dto.climberId == climberId,
  );
  return cards.length == 0 ? null : cards[0];
}

export function insertPhysicalCard(
  client: Auth.JWT,
  climberId: string,
  cardId: string,
) {
  cardsModel.appendRow(client, {
    createdAt: new Date().toISOString(),
    climberId: climberId,
    issuedCardId: cardId,
  });
}
