import type { sheets_v4 } from "googleapis";
import { google } from "googleapis";
import { getGoogleKey } from "./google_key_access";

const spreadsheetId = process.env.SPREADSHEET_ID;

function isStringTable(data: unknown[][]): data is string[][] {
  for (const row of data) {
    for (const cell of row) {
      if (typeof cell != "string") {
        return false;
      }
    }
  }
  return true;
}

let _sheets: sheets_v4.Sheets | null = null;
function getSheets() {
  if (_sheets == null) {
    const secretKey = getGoogleKey();
    _sheets = google.sheets({
      version: "v4",
      auth: new google.auth.JWT({
        email: secretKey.client_email,
        key: secretKey.private_key,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      }),
    });
  }
  return _sheets;
}

export const sheetAccess = {
  async getValues(range: string) {
    if (spreadsheetId == null) {
      throw new Error("spreadSheetId must not be null");
    }

    const sheet = await getSheets().spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range,
    });

    const data: unknown[][] | undefined | null = sheet.data.values;
    if (data == null) {
      throw new Error("sheet " + range + " is missing");
    } else if (!isStringTable(data)) {
      throw new Error("sheet " + range + " has a cell that is not a string");
    }

    return data;
  },

  async update(range: string, value: (string | undefined)[]) {
    if (spreadsheetId == null) {
      throw new Error("spreadSheetId must not be null");
    }

    console.log(range, "update", value);
    const values = [value];
    getSheets().spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: "RAW",
      requestBody: { values },
    });
  },

  async append(range: string, value: (string | undefined)[]) {
    if (spreadsheetId == null) {
      throw new Error("spreadSheetId must not be null");
    }

    console.log(`${range}: append ${value}`);
    const values = [value];
    getSheets().spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "RAW",
      requestBody: { values },
    });
  },
};
