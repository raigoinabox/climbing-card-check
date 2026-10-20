import { sendRegistrationEmail } from "#server/utils/email_service";
import { z } from "zod";
import { findExamsByUuid } from "#server/utils/exams_db";

const bodySchema = z.object({ uuid: z.string() });

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, (body) => bodySchema.parse(body));
  await requireUserSession(event);

  const exams = await findExamsByUuid(body.uuid);
  for (const exam of exams) {
    if (exam.email != null && getExamStatus(exam) == "inactive") {
      await sendRegistrationEmail(exam.email, body.uuid);
    }
  }
});
