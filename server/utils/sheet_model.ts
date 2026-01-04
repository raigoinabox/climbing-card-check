import { SheetAccess } from "./sheet_access";

type Entity<T extends string> = { [P in T]?: string };

// global so that different SheetModels share a connection
const table = new SheetAccess();

export class SheetModel<T extends string> {
  private sheetName: string;
  private headers: T[];
  private headerIndexes: Map<T, number> | null = null;
  private positions = new WeakMap<Entity<T>, number>();
  private fixedHeaders = false;
  private dataRowIndex = 2;

  static fixed<T extends string>(sheetName: string, headers: T[]) {
    const model = new SheetModel<T>(sheetName, headers);
    model.headerIndexes = new Map<T, number>();
    for (const [index, header] of headers.entries()) {
      model.headerIndexes.set(header, index);
    }
    model.dataRowIndex = 1;
    model.fixedHeaders = true;
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
    const headers = data[this.dataRowIndex - 1];
    if (headers == null) {
      throw new Error("Sheet is missing second header row");
    }
    const headerIndexes = this.mapHeaderIndexes(headers);

    const dtos: Entity<T>[] = [];

    for (const [index, row] of data.entries()) {
      if (this.dataRowIndex <= index) {
        const dto: Entity<T> = {};
        for (const [header, index] of headerIndexes) {
          const value = row[index];
          dto[header] = value == "" ? undefined : value;
        }
        if (filter(dto)) {
          dtos.push(dto);
          this.positions.set(dto, index + 1);
        }
      }
    }

    return dtos;
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
    return await table.getValues(range);
  }

  async save(entity: Entity<T>) {
    const position = this.positions.get(entity);
    if (position == null) {
      throw new Error("Trying to save an entity that has no saved position");
    }
    const row = await this.entityToRow(entity);
    await table.update(`${this.sheetName}!${position}:${position}`, row);
  }

  private async entityToRow(entity: Entity<T>) {
    const indexes = await this.getHeaderIndexes();
    const appendRow: (string | undefined)[] = [];
    for (const [header, index] of indexes) {
      appendRow[index] = entity[header];
    }
    return appendRow;
  }

  // async appendRow(entity: Entity<T>) {
  //   const appendRow = await this.entityToRow(entity);

  //   const values = [appendRow];

  //   const result = await sheets.spreadsheets.values.append({
  //     auth: await getConnection(),
  //     spreadsheetId: spreadsheetId,
  //     range: this.sheetName,
  //     valueInputOption: "RAW",
  //     requestBody: { values },
  //   });

  //   return result;
  // }
}
