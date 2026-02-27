import type { CardClimberDto } from "~~/shared/types/api_types";
import { findExamById } from "../utils/exams_db";
import { findCardByClimber } from "../utils/physical_cards_db";
import { isIdCodeValid } from "#shared/utils/climber_utils";
import { z } from "zod";

const querySchema = z.object({ id: z.string() });

export default defineEventHandler(async (event): Promise<CardClimberDto> => {
  const { id } = await getValidatedQuery(event, (params) =>
    querySchema.parse(params),
  );

  if (!isIdCodeValid(id)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid id code" });
  }

  const exam = await findExamById(id);
  const cardSerialId = await findCardByClimber(id);
  return { ...exam, cardSerialId: cardSerialId?.issuedCardId };
});
