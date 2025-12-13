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

let _connection: Auth.JWT | null = null;
async function getConnection() {
  if (_connection == null) {
    const secretKey = load();
    const jwtClient = new google.auth.JWT({
      email: secretKey.client_email,
      key: secretKey.private_key,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    await jwtClient.authorize();
    _connection = jwtClient;
  }

  return _connection;
}

type Entity<T extends string> = { [P in T]?: string };

export class SheetModel<T extends string> {
  sheetName: string;
  headers: T[];
  headerIndexes: Map<T, number> | null = null;
  positions = new WeakMap<Entity<T>, number>();
  dataRowIndex = 2;

  static fixed<T extends string>(sheetName: string, headers: T[]) {
    const model = new SheetModel<T>(sheetName, headers);
    model.headerIndexes = new Map<T, number>();
    for (const [index, header] of headers.entries()) {
      model.headerIndexes.set(header, index);
    }
    model.dataRowIndex = 1;
    return model;
  }

  constructor(sheetName: string, headers: T[]) {
    this.sheetName = sheetName;
    this.headers = headers;
  }

  async fetchData(filter: (dto: Entity<T>) => boolean) {
    const data = await this.fetchTable(this.sheetName);
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
      if (this.dataRowIndex <= index) {
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

  async appendRow(entity: Entity<T>) {
    const appendRow = await this.entityToRow(entity);

    const values = [appendRow];

    const result = await sheets.spreadsheets.values.append({
      auth: await getConnection(),
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

  private async getHeaderIndexes() {
    if (this.headerIndexes == null) {
      const [headerRow] = await this.fetchTable(this.sheetName + "!2:2");
      if (headerRow == null) {
        throw new Error("headerRow does not exist");
      }

      // mapHeaderIndexes sets this.headerIndexes
      return this.mapHeaderIndexes(headerRow);
    }

    return this.headerIndexes;
  }

  private async fetchTable(range: string) {
    if (spreadsheetId == null) {
      throw new Error("spreadSheetId must not be null");
    }

    const sheet = await sheets.spreadsheets.values.get({
      auth: await getConnection(),
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

  async save(entity: Entity<T>) {
    const position = this.positions.get(entity);
    if (position == null) {
      throw new Error("Trying to save an entity that has no saved position");
    }
    const row = await this.entityToRow(entity);
    const values = [row];
    await sheets.spreadsheets.values.update({
      auth: await getConnection(),
      spreadsheetId: spreadsheetId,
      range: `${this.sheetName}!${position}:${position}`,
      valueInputOption: "RAW",
      requestBody: { values },
    });
  }

  private async entityToRow(entity: Entity<T>) {
    const indexes = await this.getHeaderIndexes();
    const appendRow: (string | undefined)[] = [];
    for (const [header, index] of indexes) {
      appendRow[index] = entity[header];
    }
    return appendRow;
  }
}
