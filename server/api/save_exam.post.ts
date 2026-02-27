import { isIdCodeValid } from "#shared/utils/climber_utils";
import { addExam, examSchema } from "../utils/exams_db";

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, (body) => examSchema.parse(body));
  const { user } = await requireUserSession(event);

  if (!isIdCodeValid(body.climberIdCode)) {
    throw createError({
      statusCode: 400,
      message: "Ronija isikukood ei ole õige",
    });
  }

  await addExam(body, user);

  return {};
});
