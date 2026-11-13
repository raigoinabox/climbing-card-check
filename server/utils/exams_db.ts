import { type sheetInfer, SheetModel } from "./sheet_model";
import type { ExamDto } from "#shared/types/api_types";
import type { ExamClimberDto } from "../../shared/types/api_types";
import { getIsoNow } from "./date_utils";
import { z } from "zod";
import type { User } from "#auth-utils";

const examsModel = new SheetModel(
  "Andmebaas",
  [
    "formFillTime",
    "id",
    "name",
    "certificate",
    "examDate",
    "expiryDate",
    "examiner",
    "email",
    "comment",
    "formFillerEmail",
    "montonioUuid",
    "dataConsent",
    "responsiblityConsent",
  ],
  z.object({
    formFillTime: z.string().optional(),
    id: z.string().optional(),
    name: z.string().optional(),
    certificate: z.literal(["roheline", "punane"]),
    examDate: z.string().optional(),
    expiryDate: z.string().optional(),
    examiner: z.string().optional(),
    email: z.string().optional(),
    comment: z.string().optional(),
    formFillerEmail: z.string().optional(),
    montonioUuid: z.string().optional(),
    dataConsent: z.string().optional(),
    responsiblityConsent: z.string().optional(),
  }),
);

export type Exam = sheetInfer<typeof examsModel>;

export function findExamsByClimberId(id: string) {
  return examsModel.fetchData((dto) => dto.id == id);
}

export function findExamsByUuid(uuid: string) {
  return examsModel.fetchData((dto) => dto.montonioUuid == uuid);
}

const timestamp = new Date();
export async function addExam(
  exam: ExamDto,
  climber: ExamClimberDto,
  user: User,
) {
  const montonioUuid = crypto.randomUUID();
  await examsModel.appendRow({
    formFillTime: timestamp.toISOString(),
    id: climber.idCode,
    name: climber.name,
    email: climber.email,
    examiner: user.name,
    formFillerEmail: user.email,
    examDate: exam.examDate ?? undefined,
    certificate: exam.examType,
    comment: climber.comment,
    montonioUuid,
  });

  return montonioUuid;
}

export async function registerLegalConfirmations(uuid: string) {
  const exams = await examsModel.fetchData((dto) => dto.montonioUuid == uuid);
  const exam = exams[0];
  if (exam == null) {
    throw new ValidationError("Sellist eksamit ei ole meil registreeritud");
  }

  const now = getIsoNow();
  exam.dataConsent = now;
  exam.responsiblityConsent = now;
  await examsModel.save(exam);
  return exam;
}

export function formatDate(parsed: Date) {
  return parsed.toISOString().substring(0, 10);
}

function calculateExpiryDate(date: string) {
  const newExpiryDate = new Date(date);
  newExpiryDate.setUTCFullYear(newExpiryDate.getUTCFullYear() + 4);
  return formatDate(newExpiryDate);
}

export async function registerPayment(uuid: string) {
  console.log("registerPayment", uuid);
  const exams = await examsModel.fetchData((dto) => dto.montonioUuid == uuid);
  const exam = exams[0];
  if (exam == null || exam.examDate == null) {
    console.log("No such exam", exam);
    throw new ValidationError("Sellist eksamit ei ole meil registreeritud");
  }

  console.log("Setting expiryDate for exam", exam);
  exam.expiryDate = calculateExpiryDate(exam.examDate);
  await examsModel.save(exam);
}

export async function removePayment(uuid: string) {
  console.log("removePayment", uuid);
  const exams = await examsModel.fetchData((dto) => dto.montonioUuid == uuid);
  const exam = exams[0];
  if (exam == null || exam.examDate == null) {
    throw new ValidationError("Sellist eksamit ei ole meil registreeritud");
  }

  exam.expiryDate = "";
  await examsModel.save(exam);
  return exam;
}

export function getExams(userEmail: string) {
  return examsModel.fetchData((exam) => exam.formFillerEmail == userEmail);
}

export const adminExamFormSchema = z.object({
  examinerName: z.string(),
  examDate: z.iso.date(),
  examType: z.literal(["roheline", "punane"]),
  climber: z.object({
    name: z.string().trim().max(100),
    idCode: z.string().trim().regex(/^\d+$/).max(100),
    foreigner: z.boolean(),
    email: z.email(),
    comment: z.string().trim().max(100),
  }),
});

export async function adminAddExam(
  exam: z.infer<typeof adminExamFormSchema>,
  user: User,
) {
  const montonioUuid = crypto.randomUUID();
  const now = getIsoNow();
  await examsModel.appendRow({
    formFillTime: timestamp.toISOString(),
    id: exam.climber.idCode,
    name: exam.climber.name,
    email: exam.climber.email,
    examiner: exam.examinerName,
    formFillerEmail: user.email,
    examDate: exam.examDate,
    expiryDate: calculateExpiryDate(exam.examDate),
    certificate: exam.examType.toLowerCase(),
    comment: exam.climber.comment,

    dataConsent: now,
    responsiblityConsent: now,
    montonioUuid,
  });
}
