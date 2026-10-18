import { getExams } from "#server/utils/exams_db";
import { getExamStatus } from "#server/utils/exams_service";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const exams = await getExams(user.email);
  const mapped = [];
  for (let i = exams.length - 1; 0 <= i && exams.length <= i + 100; i--) {
    const exam = exams[i]!;
    mapped.push({
      uuid: exam.montonioUuid,
      name: exam.name,
      examDate: exam.examDate,
      email: exam.email,
      status: getExamStatus(exam),
    });
  }
  return mapped;
});
