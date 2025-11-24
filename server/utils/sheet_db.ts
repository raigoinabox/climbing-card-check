import { Auth, google } from "googleapis";

const spreadsheetId = process.env.SPREADSHEET_ID;
const sheets = google.sheets("v4");

export class SheetModel<T extends string> {
  sheetName: string;
  headers: T[];

  constructor(sheetName: string, headers: T[]) {
    this.sheetName = sheetName;
    this.headers = headers;
  }

  async fetchData(
    client: Auth.JWT,
    filter: (dto: Partial<Record<T, string>>) => boolean,
  ) {
    const sheet = await this.fetchAllData(client);
    const data: string[][] | undefined | null = sheet.data.values;
    if (data == null) {
      throw new Error("sheet " + this.sheetName + " is missing");
    }

    return this.mapAndFilter(data, filter);
  }

  private async fetchAllData(client: Auth.JWT) {
    if (spreadsheetId == null) {
      throw new Error("spreadSheetId must not be null");
    }

    return sheets.spreadsheets.values.get({
      auth: client,
      spreadsheetId: spreadsheetId,
      range: this.sheetName,
    });
  }

  private mapAndFilter(
    data: string[][],
    filter: (dto: Partial<Record<T, string>>) => boolean,
  ) {
    // Ignore human-readable headers(the first row), because those can change any time
    // form is changed. Will use the second row to key the columns
    const headers = data[1];
    if (headers == null) {
      throw new Error("Sheet is missing second header row");
    }

    const headerIndexes = new Map<T, number>();
    for (const header of this.headers) {
      headerIndexes.set(header, headers.indexOf(header));
    }

    const dtos: Partial<Record<T, string>>[] = [];
    for (const row of data) {
      const dto: Partial<Record<T, string>> = {};
      for (const [header, index] of headerIndexes) {
        dto[header] = row[index];
      }
      if (filter(dto)) {
        dtos.push(dto);
      }
    }

    return dtos;
  }
}
