import {
  insertPhysicalCard,
  ValidationError,
} from "../utils/physical_cards_service";
import { isIdCodeValid } from "#shared/utils/climber_utils";
import { z } from "zod";

const serialCardSchema = z.object({
  climberIdCode: z.string(),
  serialCode: z.string(),
});

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, (body) =>
    serialCardSchema.parse(body),
  );
  const { user } = await requireUserSession(event);

  if (!isIdCodeValid(body.climberIdCode)) {
    throw createError({
      statusCode: 400,
      message: "Ronija isikukood ei ole õige",
    });
  }
  try {
    await insertPhysicalCard(body.climberIdCode, body.serialCode, user.name);
  } catch (e) {
    if (e instanceof ValidationError) {
      throw createError({ statusCode: 400, data: e.message });
    } else {
      throw e;
    }
  }

  return {};
});
