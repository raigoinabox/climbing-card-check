import { z } from "zod";
import { sendRegistrationEmail } from "#server/utils/email_service";
import { addExam, getNewExam } from "#server/utils/exams_db";
import type { ExamDto } from "#shared/types/api_types";
import { isExaminerNameAllowed, isPaidExamAllowed } from "#shared/utils/rights";

const examFormSchema = z.object({
  paid: z.boolean(),
  examinerName: z.string().trim().max(100),
  examDate: z.iso.date(),
  examType: z.literal(["roheline", "punane"]),
  climbers: z.array(
    z.object({
      name: z.string().trim().max(100),
      idCode: z.string().trim().max(100),
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
      const exam = getNewExam(
        body,
        climber,
        isExaminerNameAllowed(user.role) ? body.examinerName : user.email,
        user,
      );
      if (isPaidExamAllowed(user.role) && body.paid) {
        const now = getIsoNow();
        exam.dataConsent = now;
        exam.responsiblityConsent = now;
        exam.expiryDate = calculateExpiryDate(body.examDate);
      } else {
        await sendRegistrationEmail(
          climber.email,
          exam.montonioUuid,
          body.examType,
        );
      }
      await addExam(exam);

      savedCount += 1;
    }
  } catch (e) {
    console.log(e);
    // nothing else useful to do.
  }

  return { savedCount };
});
