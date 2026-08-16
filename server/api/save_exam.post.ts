import { sendRegistrationEmail } from "../utils/email_service";
import { addExam, examSchema } from "../utils/exams_db";

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, (body) => examSchema.parse(body));
  const { user } = await requireUserSession(event);
  const uuid = await addExam(body, user);

  await sendRegistrationEmail(body.climberEmail, uuid);

  return {};
});
