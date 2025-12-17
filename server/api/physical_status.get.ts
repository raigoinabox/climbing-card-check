export default defineEventHandler(async (event): Promise<CardClimberDto> => {
  const { id } = getQuery(event);

  if (typeof id != "string" || !isIdCodeValid(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid id code",
    });
  }

  const exam = await findExamById(id);
  const cardSerialId = await findCardByClimber(id);
  return {
    ...exam,
    cardSerialId: cardSerialId?.issuedCardId,
  };
});
