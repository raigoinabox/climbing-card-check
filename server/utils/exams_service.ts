import { strict as assert } from "node:assert";
import { inspect } from "node:util";
import { type Exam, findExamsByClimberId } from "./exams_db";
import { formatDate, ensureExhaustive } from "#shared/utils/climber_utils";

const parseDate = (rawValue: string) => {
  const parsed = new Date(rawValue);
  assert(!isNaN(parsed.getTime()), `Invalid date: "${inspect(rawValue)}"`);
  return parsed;
};

export function getExamStatus(exam: Exam) {
  if (!exam.expiryDate) {
    return "inactive";
  } else {
    const expiryTime = parseDate(exam.expiryDate);
    if (expiryTime.getTime() < Date.now()) {
      return "expired";
    } else if (exam.certificate === "roheline") {
      return "roheline";
    } else if (exam.certificate === "punane") {
      return "punane";
    } else {
      ensureExhaustive(exam.certificate);
    }
  }
}

function findBestCertificate(certificates: Iterable<Exam>) {
  // The best certificate is found as follows:
  // 1. Last issued RED card (that is still valid)
  // 2. Last issued GREEN card (that is still valid)
  // 3. Any expired card
  // 4. Any invalid card
  let bestRedCard = null;
  let bestGreenCard = null;
  let anyExpiredCard = null;

  for (const row of certificates) {
    const card = {
      id: row.id,
      certificate: row.certificate,
      name: row.name,
      examiner: row.examiner,
      examTime: parseDate(row.examDate),
      expiryTime:
        row.expiryDate != null ? parseDate(row.expiryDate) : undefined,
    };

    const status = getExamStatus(row);
    if (status == "inactive") {
      // nothing to do
    } else if (status == "expired") {
      anyExpiredCard = {
        ...card,
        certificate: "expired",
        valid: false,
      } as const;
    } else if (status == "roheline") {
      if (!bestGreenCard || card.examTime > bestGreenCard.examTime) {
        bestGreenCard = { ...card, valid: true };
      }
    } else if (status == "punane") {
      if (!bestRedCard || card.examTime > bestRedCard.examTime) {
        bestRedCard = { ...card, valid: true };
      }
    } else {
      ensureExhaustive(status);
    }
  }

  const bestCard = bestRedCard ?? bestGreenCard ?? anyExpiredCard;
  if (bestCard == null) {
    throw new Error("couldn't find any card");
  }
  return bestCard;
}

export async function findExamById(id: string) {
  const filteredRows = await findExamsByClimberId(id);

  const bestCertificate = findBestCertificate(filteredRows);

  // Check for all cases why the certificate might be invalid
  const inspectString = `Invalid certificate: ${inspect(bestCertificate)}`;
  assert(bestCertificate.name, inspectString);
  assert(bestCertificate.examiner, inspectString);

  return {
    ...bestCertificate,
    examTime: formatDate(bestCertificate.examTime),
    expiryTime:
      bestCertificate.expiryTime != null
        ? formatDate(bestCertificate.expiryTime)
        : undefined,
  };
}
