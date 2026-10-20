import { type sheetInfer, SheetModel } from "./sheet_model";
import type { ExamDto } from "#shared/types/api_types";
import type { User } from "#auth-utils";
import type { ExamClimberDto } from "../../shared/types/api_types";
import { getIsoNow } from "./date_utils";

const examsModel = new SheetModel("Andmebaas", [
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
]);

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
    certificate: exam.examType.toLowerCase(),
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

function formatDate2(date: Date) {
  const year = date.getFullYear().toString();
  const month = date
    .getMonth()
    .toLocaleString("en", { minimumIntegerDigits: 2 });
  const day = date.getDate().toLocaleString("en", { minimumIntegerDigits: 2 });
  return year + "-" + month + "-" + day;
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
  const newExpiryDate = new Date(exam.examDate);
  newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 4);
  exam.expiryDate = formatDate2(newExpiryDate);
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
