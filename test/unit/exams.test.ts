import { describe, test, expect } from "vitest";
import { findExamById } from "../../server/utils/exams_db";
import { isIdCodeValid } from "../../server/utils/climber_utils";

const testCases = [
  {
    id: "10001010002",
    certificate: "roheline",
    name: "Robert Roheline",
    examiner: "Ilmar Instruktor",
    examTime: "2022-12-08",
    expiryTime: "2026-12-08",
  },
  {
    id: "20202020004",
    certificate: "punane",
    name: "Pulvi Punane",
    examiner: "Eerik Eksamineerija",
    examTime: "2022-12-15",
    expiryTime: "2026-12-15",
  },
  {
    id: "30303030004",
    certificate: "punane",
    name: "Kaarel Kehtetu",
    examiner: "Tiit Testija",
    examTime: "2017-11-15",
    expiryTime: "2021-03-06",
  },
  {
    id: "50505050003",
    certificate: "roheline",
    name: "Agnes Aegumas",
    examiner: "Andrei Popov",
    examTime: "2012-12-01",
    expiryTime: "2024-05-10",
  },
  {
    id: "80000000008",
    certificate: "roheline",
    name: "Viktor Vormiga",
    examiner: "Eerik Eksamineerija",
    examTime: "2023-12-01",
    expiryTime: "2026-02-14",
  },
  {
    id: "90000000009",
    certificate: "roheline",
    name: "Kaspar Katsejänes",
    examiner: "Tiit Testija",
    examTime: "2023-01-28",
    expiryTime: "2026-05-25",
  },
];

const invalidCases = [
  { id: "00000000000", expectedError: /not found/i },
  { id: "40404040009", expectedError: /invalid certificate/i },
  { id: "70000000007", expectedError: /invalid certificate/i },
  { id: "60606060008", expectedError: /invalid date/i },
];

describe("Exams", () => {
  test.for(testCases)("should find $id", async (expected) => {
    const id = expected.id;
    if (!isIdCodeValid(id)) {
      throw new Error(id);
    }

    const result = await findExamById(id);
    expect(result).toEqual(expected);
  });

  test.for(invalidCases)(
    "should error with $id",
    async ({ id, expectedError }) => {
      if (!isIdCodeValid(id)) {
        throw new Error(id);
      }
      await expect(() => findExamById(id)).rejects.toThrowError(expectedError);
    },
  );
});
