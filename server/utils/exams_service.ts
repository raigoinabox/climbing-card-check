import { strict as assert } from "node:assert";
import { inspect } from "node:util";
import { type Exam, findExamsByClimberId } from "./exams_db";

const CODE = {
  GREEN: "roheline",
  RED: "punane",
  NONE: "none",
  UNKNOWN: "unknown",
} as const;

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

const SECOND_IN_MILLISECONDS = 1000;
const MINUTE_IN_MILLISECONDS = 60 * SECOND_IN_MILLISECONDS;
const HOUR_IN_MILLISECONDS = 60 * MINUTE_IN_MILLISECONDS;
const DAY_IN_MILLISECONDS = 24 * HOUR_IN_MILLISECONDS;
function getExpiryTimeFromFormFillTime(normDate: Date | null) {
  if (!normDate) {
    return null;
  }
  assertValidDate(normDate);
  // Add 6 weeks
  const exp = normDate.valueOf() + 6 * 7 * DAY_IN_MILLISECONDS;
  return new Date(exp);
}

export function getExamStatus(exam: Exam) {
  if (!exam.expiryDate) {
    return "inactive";
  } else {
    const expiryTime =
      parseDate(exam.expiryDate) ??
      getExpiryTimeFromFormFillTime(parseDate(exam.formFillTime));
    if (expiryTime == null) {
      return "inactive";
    } else if (expiryTime.getTime() < Date.now()) {
      return "expired";
    } else if (exam.certificate === "roheline") {
      return "roheline";
    } else if (exam.certificate === "punane") {
      return "punane";
    } else {
      // The card doesn't have a valid certificate (neither green nor red)
      return "inactive";
    }
  }
}

function findBestCertificate(certificates: Exam[]) {
  // The best certificate is found as follows:
  // 1. Last issued RED card (that is still valid)
  // 2. Last issued GREEN card (that is still valid)
  // 3. Any expired card
  // 4. Any invalid card
  let bestRedCard = null;
  let bestGreenCard = null;
  let anyExpiredCard = null;
  let anyInvalidCard = null;

  for (const row of certificates) {
    const card = {
      id: row.id!,
      certificate: normalizeCertificate(row.certificate),
      name: row.name,
      examiner: row.examiner ?? null,
      examTime: parseDate(row.examDate),
      expiryTime:
        parseDate(row.expiryDate) ??
        getExpiryTimeFromFormFillTime(parseDate(row.formFillTime)),
    };

    const status = getExamStatus(row);
    if (status == "inactive") {
      anyInvalidCard = { ...card, valid: false };
    } else if (status == "expired") {
      anyExpiredCard = { ...card, valid: false };
    } else if (status == "roheline") {
      if (
        !bestGreenCard ||
        bestGreenCard.examTime == null ||
        (card.examTime != null && card.examTime > bestGreenCard.examTime)
      ) {
        bestGreenCard = { ...card, valid: true };
      }
    } else if (status == "punane") {
      if (
        !bestRedCard ||
        bestRedCard.examTime == null ||
        (card.examTime != null && card.examTime > bestRedCard.examTime)
      ) {
        bestRedCard = { ...card, valid: true };
      }
    }
  }

  const bestCard =
    bestRedCard ?? bestGreenCard ?? anyExpiredCard ?? anyInvalidCard;
  if (bestCard == null) {
    throw new Error("couldn't find any card");
  }
  return bestCard;
}

export async function findExamById(id: string) {
  const filteredRows = await findExamsByClimberId(id);

  assert(filteredRows.length, "Not found");

  const bestCertificate = findBestCertificate(filteredRows);

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
