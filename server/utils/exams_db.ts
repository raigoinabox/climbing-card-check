import { strict as assert } from "node:assert";
import { inspect } from "node:util";
import { SheetModel } from "./sheet_model";
import type { CertificateState } from "#shared/types/api_types";
import type { User } from "#auth-utils";
import { z } from "zod";

const CODE = {
  GREEN: "roheline",
  RED: "punane",
  NONE: "none",
  UNKNOWN: "unknown",
} as const;

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

// Raw input from the sheet => valueof CODE
function normalizeCertificate(rawCertificate: string | undefined) {
  if (rawCertificate == null) {
    return CODE.NONE;
  }

  const lowered = rawCertificate.toLowerCase();
  if (lowered == "punane") {
    return CODE.RED;
  } else if (lowered == "roheline") {
    return CODE.GREEN;
  } else {
    console.error(`Invalid certificate input: ${rawCertificate}`);
    return CODE.UNKNOWN;
  }
}

const assertValidDate = (parsed: Date) => {
  assert(
    parsed instanceof Date && !isNaN(parsed.valueOf()),
    `Invalid Date: "${inspect(parsed)}"`,
  );
};

const formatDate = (parsed: Date) => {
  assertValidDate(parsed);
  return parsed.toISOString().substring(0, 10);
};

const parseDate = (rawValue: string | undefined) => {
  if (!rawValue) {
    return null;
  }
  const parsed = new Date(rawValue);
  assert(!isNaN(parsed.getTime()), `Invalid date: "${inspect(rawValue)}"`);
  return parsed;
};

function findBestCertificate<
  T extends {
    expiryTime: Date | null;
    certificate: CertificateState;
    examTime: Date | null;
  },
>(certificates: T[]) {
  // The best certificate is found as follows:
  // 1. Last issued RED card (that is still valid)
  // 2. Last issued GREEN card (that is still valid)
  // 3. Any expired card
  // 4. Any invalid card
  let bestRedCard = null;
  let bestGreenCard = null;
  let anyExpiredCard = null;
  let anyInvalidCard = null;

  for (const card of certificates) {
    if (!card.expiryTime) {
      anyInvalidCard = card;
    } else if (card.expiryTime.getTime() < Date.now()) {
      anyExpiredCard = card;
    } else if (card.certificate === CODE.GREEN) {
      if (
        !bestGreenCard ||
        bestGreenCard.examTime == null ||
        (card.examTime != null && card.examTime > bestGreenCard.examTime)
      ) {
        bestGreenCard = card;
      }
    } else if (card.certificate === CODE.RED) {
      if (
        !bestRedCard ||
        bestRedCard.examTime == null ||
        (card.examTime != null && card.examTime > bestRedCard.examTime)
      ) {
        bestRedCard = card;
      }
    } else {
      // The card doesn't have a valid certificate (neither green nor red)
      anyInvalidCard = card;
    }
  }

  const bestCard =
    bestRedCard ?? bestGreenCard ?? anyExpiredCard ?? anyInvalidCard;
  if (bestCard == null) {
    throw new Error("couldn't find any card");
  }
  return bestCard;
}

const SECOND_IN_MILLISECONDS = 1000;
const MINUTE_IN_MILLISECONDS = 60 * SECOND_IN_MILLISECONDS;
const HOUR_IN_MILLISECONDS = 60 * MINUTE_IN_MILLISECONDS;
const DAY_IN_MILLISECONDS = 24 * HOUR_IN_MILLISECONDS;
const getExpiryTimeFromFormFillTime = (normDate: Date | null) => {
  if (!normDate) {
    return null;
  }
  assertValidDate(normDate);
  // Add 6 weeks
  const exp = normDate.valueOf() + 6 * 7 * DAY_IN_MILLISECONDS;
  return new Date(exp);
};

export async function findExamById(id: string) {
  const filteredRows = await examsModel.fetchData((dto) => dto.id == id);

  const parsedCertificates = filteredRows.map((row) => {
    const rawCertificate = row.certificate;
    const certificate = normalizeCertificate(rawCertificate);

    return {
      id,
      certificate,
      name: row.name,
      examiner: row.examiner ?? null,
      examTime: parseDate(row.examDate),
      expiryTime:
        parseDate(row.expiryDate) ??
        getExpiryTimeFromFormFillTime(parseDate(row.formFillTime)),
    };
  });

  assert(parsedCertificates.length, "Not found");

  const bestCertificate = findBestCertificate(parsedCertificates);

  // Check for all cases why the certificate might be invalid
  const inspectString = `Invalid certificate: ${inspect(bestCertificate)}`;
  assert(bestCertificate.name, inspectString);
  assert(bestCertificate.examiner, inspectString);
  assert(bestCertificate.examTime, inspectString);
  assert(bestCertificate.expiryTime, inspectString);

  return {
    ...bestCertificate,
    examTime: formatDate(bestCertificate.examTime),
    expiryTime: formatDate(bestCertificate.expiryTime),
  };
}

export const examSchema = z.object({
  climberName: z.string(),
  climberIdCode: z.string(),
  climberEmail: z.email("Kontroll emaili aadressi"),
  examDate: z.iso.date(),
  examType: z.literal(["roheline", "punane"]),
  commentary: z.string().nullable(),
});
export type ExamSchema = z.infer<typeof examSchema>;

export async function addExam(exam: ExamSchema, user: User) {
  const timestamp = new Date();
  const montonioUuid = crypto.randomUUID();
  await examsModel.appendRow({
    formFillTime: timestamp.toISOString(),
    id: exam.climberIdCode,
    name: exam.climberName,
    email: exam.climberEmail,
    examiner: user.name,
    formFillerEmail: user.email,
    examDate: exam.examDate,
    certificate: exam.examType.toLowerCase(),
    comment: exam.commentary ?? undefined,
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

  const now = new Date().toISOString();
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
    throw new ValidationError("Sellist eksamit ei ole meil registreeritud");
  }

  const newExpiryDate = new Date(exam.examDate);
  newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 4);
  exam.expiryDate = formatDate2(newExpiryDate);
  examsModel.save(exam);
}

export async function removePayment(uuid: string) {
  console.log("removePayment", uuid)
  const exams = await examsModel.fetchData((dto) => dto.montonioUuid == uuid);
  const exam = exams[0];
  if (exam == null || exam.examDate == null) {
    throw new ValidationError("Sellist eksamit ei ole meil registreeritud");
  }

  exam.expiryDate = "";
  examsModel.save(exam);
  return exam;
}
