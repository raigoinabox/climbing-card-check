import {
  insertPhysicalCard,
  ValidationError,
} from "../utils/physical_cards_service";
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
