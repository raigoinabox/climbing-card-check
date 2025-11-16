import { strict as assert } from "node:assert";
import { inspect } from "node:util";

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
  if (!parsed) {
    return null;
  }
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

// Column keys are stored in the second row of the DB
const filterColumnHeader = "id";
const certificateHeader = "certificate";
const nameHeader = "name";
const examinerHeader = "examiner";
const examDateHeader = "examDate";
const expiryDateHeader = "expiryDate";
const formFillTimeHeader = "formFillTime";

export const findById = (data: string[][], id: string) => {
  assertValidId(id);

  // Ignore human-readable headers(the first row), because those can change any time
  // form is changed. Will use the second row to key the columns
  const headers = data[1];
  assert(headers != null);

  const filterColumnIdx = headers.indexOf(filterColumnHeader);
  const certificateColumnIdx = headers.indexOf(certificateHeader);
  const nameColumnIdx = headers.indexOf(nameHeader);
  const examinerColumnIdx = headers.indexOf(examinerHeader);
  const examDateColumnIdx = headers.indexOf(examDateHeader);
  const expiryDateColumnIdx = headers.indexOf(expiryDateHeader);
  const formFillTimeColumnIdx = headers.indexOf(formFillTimeHeader);

  assert(
    ~filterColumnIdx,
    `Filter column not found. Looked for "${filterColumnHeader}"`,
  );
  assert(
    ~certificateColumnIdx,
    `Certificate column not found. Looked for "${certificateHeader}"`,
  );
  assert(
    ~nameColumnIdx,
    `Certificate column not found. Looked for "${nameHeader}"`,
  );
  assert(
    ~examinerColumnIdx,
    `Examiner column not found. Looked for "${examinerHeader}"`,
  );
  assert(
    ~examDateColumnIdx,
    `Exam time column not found. Looked for "${examDateHeader}"`,
  );
  assert(
    ~expiryDateColumnIdx,
    `Expiry time column not found. Looked for "${expiryDateHeader}"`,
  );
  if (formFillTimeColumnIdx === -1) {
    console.warn(
      `Form fill time column not found. Looked for "${formFillTimeHeader}"`,
    );
  }

  const filteredRows = data.filter((row) => {
    return row[filterColumnIdx] === id;
  });

  const parsedCertificates = filteredRows.map((row) => {
    const rawCertificate = row[certificateColumnIdx];
    const certificate = normalizeCertificate(rawCertificate ?? "");

    return {
      id,
      certificate,
      name: row[nameColumnIdx],
      examiner: row[examinerColumnIdx] || null,
      examTime: parseDate(row[examDateColumnIdx]),
      expiryTime:
        parseDate(row[expiryDateColumnIdx]) ||
        getExpiryTimeFromFormFillTime(parseDate(row[formFillTimeColumnIdx])) ||
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
};

export const isIdCodeValid = (code: string) => {
  if (code.length !== 11) {
    return false;
  }

  const nr = [];
  for (let i = 0; i < code.length && i < 10; i++) {
    nr.push(parseInt(code[i]!, 10));
  }
  const givenControlCode = parseInt(code[10]!, 10);

  if (nr.some(Number.isNaN)) {
    return false;
  }

  const controlCode =
    nr.reduce((acc, value, index) => acc + value * ((index % 9) + 1), 0) % 11;

  if (controlCode !== 10) {
    return givenControlCode === controlCode;
  }

  const controlCode2 =
    nr.reduce((acc, value, index) => acc + value * (((index + 2) % 9) + 1), 0) %
    11;

  return givenControlCode === controlCode2;
};
