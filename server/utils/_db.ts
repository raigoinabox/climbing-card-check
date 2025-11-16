import { strict as assert } from "node:assert";
import process from "node:process";
import { inspect } from "node:util";
import { Auth, google } from "googleapis";

import { findById } from "./_db.data-utils";

const spreadsheetId = process.env.SPREADSHEET_ID;
const sheetRange = "Andmebaas";
const sheets = google.sheets("v4");

assert.equal(
  typeof spreadsheetId,
  "string",
  "Expected SPREADSHEET_ID env var to be set",
);

const connect = (serviceAccountEmail: string, privateKey: string) => {
  assert.equal(
    typeof serviceAccountEmail,
    "string",
    '"serviceAccountEmail" required',
  );
  assert.equal(typeof privateKey, "string", '"serviceAccountEmail" required');

  const jwtClient = new google.auth.JWT(
    serviceAccountEmail,
    undefined,
    privateKey,
    ["https://www.googleapis.com/auth/spreadsheets"],
  );
  return jwtClient.authorize().then(() => jwtClient);
};

const fetchAllData = async (client: Auth.JWT) => {
  assert(client instanceof google.auth.JWT, '"client" required');

  return sheets.spreadsheets.values.get({
    auth: client,
    spreadsheetId: spreadsheetId,
    range: sheetRange,
  });
};

const fetchOne = async (client: Auth.JWT, id: string) => {
  assert(
    client instanceof google.auth.JWT,
    `"client" required got ${inspect(client)}`,
  );

  const sheet = await fetchAllData(client);
  const data: string[][] | undefined | null = sheet.data.values;
  assert(data != null);

  console.log({ ts: new Date(), msg: "data loaded", length: data.length });

  try {
    const result = findById(data, id);

    return {
      success: true,
      ...result,
    };
  } catch (err) {
    let message = undefined;
    if (typeof err == "object" && err != null && "message" in err) {
      message = err.message;
    }
    return {
      id,
      success: false,
      message,
    };
  }
};

const addRow = async (client: Auth.JWT, rowData: string[]) => {
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

export { connect, fetchOne, addRow };
