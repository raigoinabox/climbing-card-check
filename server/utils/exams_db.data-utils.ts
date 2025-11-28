import { strict as assert } from "node:assert";
import { inspect } from "node:util";
import { SheetModel } from "./google_sheet_db";
import { Auth } from "googleapis";

const CODE = {
  GREEN: "green",
  RED: "red",
  NONE: "none",
  UNKNOWN: "unknown",
};

const RAW_VALUE_TO_CODE = {
  roheline: CODE.GREEN,
  punane: CODE.RED,
  "": CODE.NONE,
};

const CODE_TO_REGISTRY_VALUE = {
  [CODE.GREEN]: "roheline",
  [CODE.RED]: "punane",
};

export const certificateCodeToRegistryValue = (code: string) => {
  assert.equal(
    typeof CODE_TO_REGISTRY_VALUE[code],
    "string",
    `Expected code to be a string, got ${inspect(code)}`,
  );

  return CODE_TO_REGISTRY_VALUE[code];
};

// Raw input from the sheet => valueof CODE
const normalizeCertificate = (rawCertificate: string) => {
  assert.equal(
    typeof rawCertificate,
    "string",
    `Expected "rawCertificate" to be a string, got ${inspect(rawCertificate)}`,
  );
  const lowered = rawCertificate.toLowerCase();

  if (lowered == "roheline" || lowered == "punane" || lowered == "") {
    return RAW_VALUE_TO_CODE[lowered];
  } else {
    console.error(`Invalid certificate input: ${rawCertificate}`);
    return CODE.UNKNOWN;
  }
};

const assertValidId = (id: string) => {
  assert.equal(typeof id, "string", "Expected ID to be a string");
  assert.match(id, /[0-9]{11}/, "Expected ID to consist of 11 digits");
};

const assertValidDate = (parsed: Date) => {
  assert(
    parsed instanceof Date && !isNaN(parsed.valueOf()),
    `Invalid Date: "${inspect(parsed)}"`,
  );
};

const formatDate = (parsed: Date) => {
  assertValidDate(parsed);
  return parsed.toISOString().substr(0, 10);
};

const parseDate = (rawValue: string | undefined) => {
  if (!rawValue) {
    return null;
  }
  const parsed = new Date(rawValue);
  assert(!isNaN(parsed.getTime()), `Invalid date: "${inspect(rawValue)}"`);
  return parsed;
};

const findBestCertificate = (
  certificates: {
    id: string;
    name: string | undefined;
    examiner: string | null;
    expiryTime: Date | null;
    certificate: string;
    examTime: Date | null;
  }[],
) => {
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
    bestRedCard || bestGreenCard || anyExpiredCard || anyInvalidCard || null;
  if (bestCard == null) {
    throw new Error("couldn't find any card");
  }
  return bestCard;
};

const S = 1000;
const MIN = 60 * S;
const HR = 60 * MIN;
const D = 24 * HR;
const getExpiryTimeFromFormFillTime = (normDate: Date | null) => {
  if (!normDate) {
    return null;
  }
  assertValidDate(normDate);
  // Add 6 weeks
  const exp = normDate.valueOf() + 6 * 7 * D;
  return new Date(exp);
};

const examsModel = new SheetModel("Andmebaas", [
  "id",
  "certificate",
  "name",
  "examiner",
  "examDate",
  "expiryDate",
  // According to previous code this column might not exist
  "formFillTime",
  "cardCode",
]);

export async function findById(client: Auth.JWT, id: string) {
  assertValidId(id);

  const filteredRows = await examsModel.fetchData(
    client,
    (dto) => dto.id == id,
  );

  const parsedCertificates = filteredRows.map((row) => {
    const rawCertificate = row.certificate;
    const certificate = normalizeCertificate(rawCertificate ?? "");

    return {
      id,
      certificate,
      name: row.name,
      examiner: row.examiner || null,
      examTime: parseDate(row.examDate),
      expiryTime:
        parseDate(row.expiryDate) ||
        getExpiryTimeFromFormFillTime(parseDate(row.formFillTime)) ||
        null,
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
