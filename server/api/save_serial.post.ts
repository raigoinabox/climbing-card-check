export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { climberIdCode, serialCode } = body;
  const { user } = await requireUserSession(event);

  const client = await connectToSheets();

  if (typeof climberIdCode != "string") {
    throw createError({
      statusCode: 400,
      statusMessage: "climberIdCode missing",
    });
  } else if (!isIdCodeValid(climberIdCode)) {
    throw createError({
      statusCode: 400,
      statusMessage: "climberIdCode wrong",
    });
  }
  insertPhysicalCard(client, climberIdCode, serialCode);
});
