import { Auth } from "googleapis";

const cardsModel = new SheetModel("Füüsilised kaardid", [
  "createdAt",
  "createdBy",
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

export async function insertPhysicalCard(
  client: Auth.JWT,
  climberId: string,
  cardId: string,
  userName: string,
) {
  const cards = await cardsModel.fetchData(
    client,
    (dto) => dto.climberId == climberId,
  );
  if (cards.length == 0) {
    cardsModel.appendRow(client, {
      createdAt: new Date().toISOString(),
      createdBy: userName,
      climberId: climberId,
      issuedCardId: cardId,
    });
  } else {
    const card = cards[0]!;
    card.createdAt = new Date().toISOString();
    card.createdBy = userName;
    card.issuedCardId = cardId;
    cardsModel.save(client, card);
  }
}
