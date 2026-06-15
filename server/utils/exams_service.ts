import type { User } from "#auth-utils";
import type { z } from "zod";

export async function registerExam(
  exam: z.infer<typeof examSchema>,
  user: User,
) {
  await addExam(exam, user);
}
