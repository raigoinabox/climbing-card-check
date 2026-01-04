import { describe, test, expect } from "vitest";
import { findCardByClimber } from "../../server/utils/physical_cards_db";
import { insertPhysicalCard } from "../../server/utils/physical_cards_service";
import { isIdCodeValid } from "../../server/utils/climber_utils";

describe("Physical cards", () => {
  test("Query cards", async () => {
    expect(await findCardByClimber("10001010002")).toBeNull();
    expect(await findCardByClimber("20202020004")).toEqual({
      climberId: "20202020004",
      cardType: "punane",
      issuedCardId: "01-AAA116",
    });
    expect(await findCardByClimber("90000000009")).toEqual({
      climberId: "90000000009",
      cardType: "roheline",
      issuedCardId: "01-AAA117",
    });
  });

  test("Add card failures", async () => {
    const id = "10001010002";
    const fakeId = "10001010013";
    if (!isIdCodeValid(id) || !isIdCodeValid(fakeId)) {
      throw new Error();
    }
    await expect(() =>
      insertPhysicalCard(id, "Ei ole olemas", "test"),
    ).rejects.toThrowError("Sellise seeriakoodiga kaarti ei ole");
    await expect(() =>
      insertPhysicalCard(id, "01-AAA116", "test"),
    ).rejects.toThrowError("Kaart on juba ronijaga seotud");
    await expect(() =>
      insertPhysicalCard(id, "01-AAA114", "test"),
    ).rejects.toThrowError("Kaart on valet tüüpi (roheline/punane)");
    await expect(() =>
      insertPhysicalCard(fakeId, "01-AAA113", "test"),
    ).rejects.toThrowError("Not found");
    expect(await insertPhysicalCard(id, "01-AAA113", "test")).toBeUndefined();
  });
});
