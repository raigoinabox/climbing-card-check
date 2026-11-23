import { type sheetInfer, SheetModel } from "./sheet_model";
import type { ExamClimberDto } from "#shared/types/api_types";
import { formatDate } from "#shared/utils/climber_utils";
import { getIsoNow } from "./date_utils";
import { z } from "zod";
import type { User } from "#auth-utils";
import { isExaminerNameAllowed, type Role } from "#shared/utils/rights";

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
    examDate: z.string(),
    expiryDate: z.string().optional(),
    examiner: z.string(),
    email: z.string().optional(),
    comment: z.string().optional(),
    formFillerEmail: z.string().optional(),
    montonioUuid: z.string().optional(),
    dataConsent: z.string().optional(),
    responsiblityConsent: z.string().optional(),
  }),
);

export type Exam = sheetInfer<typeof examsModel>;
type Certificate = Exam["certificate"];

export async function findExamsByClimberId(id: string) {
  return (await examsModel.fetchData()).filter((dto) => dto.id == id);
}

export async function findExamsByUuid(uuid: string) {
  return (await examsModel.fetchData()).filter(
    (dto) => dto.montonioUuid == uuid,
  );
}

const timestamp = new Date();
export function getNewExam(
  exam: { examDate: string; examType: Certificate },
  climber: ExamClimberDto,
  examiner: string,
  user: User,
): Exam & { montonioUuid: string } {
  const montonioUuid = crypto.randomUUID();
  return {
    formFillTime: timestamp.toISOString(),
    id: climber.idCode,
    name: climber.name,
    email: climber.email,
    examiner,
    formFillerEmail: user.email,
    examDate: exam.examDate,
    certificate: exam.examType,
    comment: climber.comment,
    montonioUuid,
  };
}

export async function addExam(exam: Exam) {
  await examsModel.appendRow(exam);
}

async function getExamByUuid(uuid: string) {
  const exams = await examsModel.fetchData();
  for (const exam of exams) {
    if (exam.montonioUuid == uuid) {
      return exam;
    }
  }
  // else
  throw new ValidationError("Sellist eksamit ei ole meil registreeritud");
}

export async function registerLegalConfirmations(uuid: string) {
  const exam = await getExamByUuid(uuid);

  const now = getIsoNow();
  exam.dataConsent = now;
  exam.responsiblityConsent = now;
  await examsModel.save(exam);
  return exam;
}

export function calculateExpiryDate(date: string) {
  const newExpiryDate = new Date(date);
  newExpiryDate.setUTCFullYear(newExpiryDate.getUTCFullYear() + 4);
  return formatDate(newExpiryDate);
}

export async function registerPayment(uuid: string) {
  const exam = await getExamByUuid(uuid);

  console.log("Setting expiryDate for exam", exam);
  exam.expiryDate = calculateExpiryDate(exam.examDate);
  await examsModel.save(exam);
}

export async function removePayment(uuid: string) {
  console.log("removePayment", uuid);
  const exam = await getExamByUuid(uuid);
  exam.expiryDate = "";
  await examsModel.save(exam);
  return exam;
}

export async function getExams(examinerName: string, role: Role) {
  if (isExaminerNameAllowed(role)) {
    return examsModel.fetchData();
  } else {
    return (await examsModel.fetchData()).filter(
      (exam) => exam.examiner == examinerName,
    );
  }
}
