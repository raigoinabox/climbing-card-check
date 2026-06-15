import { describe, test, expect } from "vitest";
import { isIdCodeValid } from "../../shared/utils/climber_utils";

describe("Id code check", () => {
  test("Id code check", async () => {
    expect(isIdCodeValid("39101310228")).toBeTruthy();
    expect(isIdCodeValid("39103010210")).toBeTruthy();
  });
});
