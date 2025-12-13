export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { climberIdCode, serialCode } = body;
  const { user } = await requireUserSession(event);

  if (typeof climberIdCode != "string") {
    throw createError({
      statusCode: 400,
      statusMessage: "Ronija isikukood on puudu",
    });
  } else if (!isIdCodeValid(climberIdCode)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Ronija isikukood ei ole õige",
    });
  }
  await insertPhysicalCard(climberIdCode, serialCode, user.name);

  return {};
});
