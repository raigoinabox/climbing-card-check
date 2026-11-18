import { adminExamFormSchema } from "#server/utils/exams_db";

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, (body) =>
    adminExamFormSchema.parse(body),
  );
  const { user } = await requireUserSession(event);

  if (user.role != "süsteemihaldaja") {
    if (user.role != "haldaja") {
      throw createError({ data: { description: "Kasutaja ei ole haldaja" } });
    } else if (body.paid) {
      throw createError({
        data: { description: "Kasutaja ei ole süsteemihaldaja" },
      });
    }
  }

  await adminAddExam(body, user);

  return {};
});
