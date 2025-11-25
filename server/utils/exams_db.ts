import { strict as assert } from "node:assert";
import process from "node:process";
import { Auth, google } from "googleapis";

const spreadsheetId = process.env.SPREADSHEET_ID;
const sheetRange = "Andmebaas";
const sheets = google.sheets("v4");

assert.equal(
  typeof spreadsheetId,
  "string",
  "Expected SPREADSHEET_ID env var to be set",
);

export const addRow = async (client: Auth.JWT, rowData: string[]) => {
  assert(client instanceof google.auth.JWT, '"client" required');
  assert(Array.isArray(rowData), '"rowData" must be an array');

  const values = [rowData];

  const result = await sheets.spreadsheets.values.append({
    auth: client,
    spreadsheetId: spreadsheetId,
    range: sheetRange,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values,
    },
  });

  console.log({
    ts: new Date(),
    msg: "row added",
    updatedCells: result.data.updates?.updatedCells,
  });
  return result;
};
