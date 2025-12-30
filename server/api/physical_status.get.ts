import type { CardClimberDto } from "~~/shared/types/api_types";
import { findExamById } from "../utils/exams_db";
import { findCardByClimber } from "../utils/physical_cards_db";

export default defineEventHandler(async (event): Promise<CardClimberDto> => {
  const { id } = getQuery(event);

  if (typeof id != "string" || !isIdCodeValid(id)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid id code" });
  }

  const exam = await findExamById(id);
  const cardSerialId = await findCardByClimber(id);
  return { ...exam, cardSerialId: cardSerialId?.issuedCardId };
});
