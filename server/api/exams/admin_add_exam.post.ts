import { adminAddExam, adminExamFormSchema } from "#server/utils/exams_db";

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, (body) =>
    adminExamFormSchema.parse(body),
  );
  const { user } = await requireUserSession(event);

  if (!user.admin) {
    throw createError({
      data: {
        description: "Kasutaja ei ole haldaja"
      }
    })
  }

  await adminAddExam(body, user);

  return {};
});
