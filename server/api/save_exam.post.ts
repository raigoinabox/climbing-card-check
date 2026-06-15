import { isIdCodeValid } from "#shared/utils/climber_utils";
import { sendRegistrationEmail } from "../utils/email_service";
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

  const uuid = await addExam(body, user);

  await sendRegistrationEmail(body.climberEmail, uuid);

  return {};
});
