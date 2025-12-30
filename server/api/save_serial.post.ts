import { insertPhysicalCard } from "../utils/physical_cards_service";
import { isIdCodeValid } from "../utils/climber_utils";

export default defineEventHandler(async (event) => {
  const { climberIdCode, serialCode } = await readBody(event);
  const { user } = await requireUserSession(event);

  if (typeof climberIdCode != "string") {
    throw createError({ statusCode: 400, data: "Ronija isikukood on puudu" });
  } else if (!isIdCodeValid(climberIdCode)) {
    throw createError({
      statusCode: 400,
      data: "Ronija isikukood ei ole õige",
    });
  }
  await insertPhysicalCard(climberIdCode, serialCode, user.name);

  return {};
});
