export default defineEventHandler(async (event): Promise<ClimberDto> => {
  const { id } = getQuery(event);

  if (typeof id != "string" || !isIdCodeValid(id)) {
    throw createError({
      status: 400,
      statusMessage: "Invalid id code",
    });
  }

  return await findExamById(id);
});
