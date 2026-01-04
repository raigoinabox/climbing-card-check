import { vi } from "vitest";

// @ts-expect-error typescript requires unnecessary inner unused properties
vi.mock(import("../../server/utils/sheet_access"), () => ({
  SheetAccess: class {
    getValues(range: string) {
      if (range == "Andmebaas") {
        return [
          [],
          [
            "id",
            "name",
            "certificate",
            "formFillTime",
            "examDate",
            "expiryDate",
            "examiner",
          ],
          [
            "10001010002",
            "Robert Roheline",
            "roheline",
            undefined,
            "2022-12-08",
            "2026-12-08",
            "Ilmar Instruktor",
          ],
          [
            "20202020004",
            "Pulvi Punane",
            "punane",
            undefined,
            "2022-12-15",
            "2026-12-15",
            "Eerik Eksamineerija",
          ],
          [
            "30303030004",
            "Kaarel Kehtetu",
            "punane",
            undefined,
            "2017-11-15",
            "2021-03-06",
            "Tiit Testija",
          ],
          ["40404040009"],
          [
            "50505050003",
            "Agnes Aegumas",
            "roheline",
            undefined,
            "2012-12-01",
            "2024-05-10",
            "Andrei Popov",
          ],
          ["60606060008", "Virve Vigane", undefined, "2022-35-33"],
          [
            "70000000007",
            "Ain Vormiga",
            "roheline",
            undefined,
            "2024-02-20",
            undefined,
            "Eerik Eksamineerija",
          ],
          [
            "80000000008",
            "Viktor Vormiga",
            "roheline",
            "2026-01-03",
            "2023-12-01",
            undefined,
            "Eerik Eksamineerija",
          ],
          [
            "90000000009",
            "Kaspar Katsejänes",
            "roheline",
            undefined,
            "2023-01-30",
            undefined,
            "Eerik Eksamineerija",
          ],
          [
            "90000000009",
            "Kaspar Katsejänes",
            "roheline",
            undefined,
            "2023-01-28",
            "2026-05-25",
            "Tiit Testija",
          ],
          [
            "90000000009",
            "Kaspar Katsejänes",
            "punane",
            undefined,
            "2023-01-30",
            "2024-07-20",
            "Indrek Instruktor",
          ],
        ];
      } else if (range == "Füüsilised kaardid") {
        return [
          [],
          ["01-AAA111", "roheline"],
          ["01-AAA112", "punane"],
          ["01-AAA113", "roheline"],
          ["01-AAA114", "punane"],
          ["01-AAA115", "roheline"],
          ["01-AAA116", "punane", "20202020004"],
          ["01-AAA117", "roheline", "90000000009"],
          ["01-AAA118", "punane", "36409110292"],
          ["01-AAA119", "roheline"],
        ];
      } else {
        throw new Error("Not yet implemented: " + range);
      }
    }

    update = vi.fn();
  },
}));
