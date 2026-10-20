import { sendRegistrationEmail } from "#server/utils/email_service";
import { addExam } from "#server/utils/exams_db";
import type { ExamDto } from "#shared/types/api_types";
import { z } from "zod";

const examFormSchema = z.object({
  examDate: z.iso.date(),
  examType: z.literal(["roheline", "punane"]),
  climbers: z.array(
    z.object({
      name: z.string().trim().max(100),
      idCode: z.string().trim().regex(/^\d+$/).max(100),
      foreigner: z.boolean(),
      email: z.email(),
      comment: z.string().trim().max(100),
    }),
  ),
}) satisfies z.ZodType<ExamDto>;

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, (body) =>
    examFormSchema.parse(body),
  );
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
