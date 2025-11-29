import { Auth, google } from "googleapis";

const spreadsheetId = process.env.SPREADSHEET_ID;
const sheets = google.sheets("v4");

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

export async function connectToSheets() {
  const secretKey = load();
  const jwtClient = new google.auth.JWT(
    secretKey.client_email,
    undefined,
    secretKey.private_key,
    ["https://www.googleapis.com/auth/spreadsheets"],
  );
  await jwtClient.authorize();
  return jwtClient;
}

type Entity<T extends string> = { [P in T]?: string };

export class SheetModel<T extends string> {
  sheetName: string;
  headers: T[];
  headerIndexes: Map<T, number> | null = null;
  positions = new WeakMap<Entity<T>, number>();

  constructor(sheetName: string, headers: T[]) {
    this.sheetName = sheetName;
    this.headers = headers;
  }

  async fetchData(client: Auth.JWT, filter: (dto: Entity<T>) => boolean) {
    const data = await this.fetchTable(client, this.sheetName);
    return this.mapAndFilter(data, filter);
  }

  private mapAndFilter(data: string[][], filter: (dto: Entity<T>) => boolean) {
    // Ignore human-readable headers(the first row), because those can change any time
    // form is changed. Will use the second row to key the columns
    const headers = data[1];
    if (headers == null) {
      throw new Error("Sheet is missing second header row");
    }
    const headerIndexes = this.mapHeaderIndexes(headers);

    const dtos: Entity<T>[] = [];

    for (const [index, row] of data.entries()) {
      if (2 <= index) {
        const dto: Entity<T> = {};
        for (const [header, index] of headerIndexes) {
          dto[header] = row[index];
        }
        if (filter(dto)) {
          dtos.push(dto);
          this.positions.set(dto, index + 1);
        }
      }
    }

    return dtos;
  }

  async appendRow(client: Auth.JWT, entity: Entity<T>) {
    const appendRow = await this.entityToRow(client, entity);

    const values = [appendRow];

    const result = await sheets.spreadsheets.values.append({
      auth: client,
      spreadsheetId: spreadsheetId,
      range: this.sheetName,
      valueInputOption: "RAW",
      requestBody: { values },
    });

    return result;
  }

  private mapHeaderIndexes(headers: string[]) {
    if (this.headerIndexes == null) {
      this.headerIndexes = new Map<T, number>();
      for (const header of this.headers) {
        this.headerIndexes.set(header, headers.indexOf(header));
      }
    }

    return this.headerIndexes;
  }

  private async getHeaderIndexes(client: Auth.JWT) {
    if (this.headerIndexes == null) {
      const [headerRow] = await this.fetchTable(
        client,
        this.sheetName + "!2:2",
      );
      if (headerRow == null) {
        throw new Error("headerRow does not exist");
      }

      // mapHeaderIndexes sets this.headerIndexes
      return this.mapHeaderIndexes(headerRow);
    }

    return this.headerIndexes;
  }

  private async fetchTable(client: Auth.JWT, range: string) {
    if (spreadsheetId == null) {
      throw new Error("spreadSheetId must not be null");
    }

    const sheet = await sheets.spreadsheets.values.get({
      auth: client,
      spreadsheetId: spreadsheetId,
      range,
    });

    const data: unknown[][] | undefined | null = sheet.data.values;
    if (data == null) {
      throw new Error("sheet " + this.sheetName + " is missing");
    } else if (!isStringTable(data)) {
      throw new Error(
        "sheet " + this.sheetName + " has a cell that is not a string",
      );
    }

    return data;
  }

  async save(client: Auth.JWT, entity: Entity<T>) {
    const position = this.positions.get(entity);
    if (position == null) {
      throw new Error("Trying to save an entity that has no saved position");
    }
    const row = await this.entityToRow(client, entity);
    const values = [row];
    await sheets.spreadsheets.values.update({
      auth: client,
      spreadsheetId: spreadsheetId,
      range: `${this.sheetName}!${position}:${position}`,
      valueInputOption: "RAW",
      requestBody: { values },
    });
  }

  private async entityToRow(client: Auth.JWT, entity: Entity<T>) {
    const indexes = await this.getHeaderIndexes(client);
    const appendRow: (string | undefined)[] = [];
    for (const [header, index] of indexes) {
      appendRow[index] = entity[header];
    }
    return appendRow;
  }
}
