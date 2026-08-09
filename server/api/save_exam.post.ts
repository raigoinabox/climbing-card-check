import { sendRegistrationEmail } from "../utils/email_service";
import { addExam, examSchema } from "../utils/exams_db";

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, (body) => examSchema.parse(body));
  const { user } = await requireUserSession(event);

  let savedCount = 0;
  try {
    for (const climber of body.climbers) {
      const uuid = await addExam(body, climber, user);
      await sendRegistrationEmail(climber.email, uuid);
      savedCount += 1;
    }
  } catch (e) {
    console.log(e);
    // nothing else useful to do.
  }

  return { savedCount };
});
