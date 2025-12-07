import { Auth } from "googleapis";

const cardsModel = SheetModel.fixed("Füüsilised kaardid", [
  "issuedCardId",
  "climberId",
  "issuedAt",
  "issuedBy",
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
    (dto) => dto.issuedCardId == cardId || dto.climberId == climberId,
  );
  if (cards.length == 0) {
    // no card found
    throw createError({
      statusCode: 400,
      statusMessage: "Sellise seeriakoodiga kaarti ei ole",
    });
  } else {
    for (const card of cards) {
      if (card.issuedCardId == cardId) {
        if (card.climberId != null && card.climberId != "") {
          throw createError({
            status: 400,
            statusMessage: "Kaart on juba ronijaga seotud",
          });
        }
        card.climberId = climberId;
        card.issuedAt = new Date().toISOString();
        card.issuedBy = userName;
        await cardsModel.save(client, card);
      } else if (card.climberId == climberId) {
        card.climberId = "";
        await cardsModel.save(client, card);
      }
    }
  }
}
