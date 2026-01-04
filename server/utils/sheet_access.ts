import type { sheets_v4, Auth } from "googleapis";
import { google } from "googleapis";
import { load } from "./_key";

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

export class SheetAccess {
  private connection: Auth.JWT | null = null;
  private readonly sheets: sheets_v4.Sheets;

  constructor() {
    this.sheets = google.sheets("v4");
  }

  async getValues(range: string) {
    if (spreadsheetId == null) {
      throw new Error("spreadSheetId must not be null");
    }

    const sheet = await this.sheets.spreadsheets.values.get({
      auth: await this.getConnection(),
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
  }

  async update(range: string, value: (string | undefined)[]) {
    if (spreadsheetId == null) {
      throw new Error("spreadSheetId must not be null");
    }

    const values = [value];
    this.sheets.spreadsheets.values.update({
      auth: await this.getConnection(),
      spreadsheetId,
      range,
      valueInputOption: "RAW",
      requestBody: { values },
    });
  }

  private async getConnection() {
    if (this.connection == null) {
      const secretKey = load();
      const jwtClient = new google.auth.JWT({
        email: secretKey.client_email,
        key: secretKey.private_key,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });
      await jwtClient.authorize();
      this.connection = jwtClient;
    }
    return this.connection;
  }
}
