import type { ClimberDto } from "~~/shared/types/api_types";
import { findExamById } from "../utils/exams_db";
import { isIdCodeValid } from "#shared/utils/climber_utils";
import { z } from "zod";

const querySchema = z.object({ id: z.string().min(1) });

export default defineEventHandler(async (event): Promise<ClimberDto> => {
  const { id } = await getValidatedQuery(event, (params) =>
    querySchema.parse(params),
  );

  if (!isIdCodeValid(id)) {
    throw createError({ status: 400, statusMessage: "Invalid id code" });
  }

  return await findExamById(id);
});
