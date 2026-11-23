import { sheetAccess } from "./sheet_access";
import type { z } from "zod";

type Entity<T extends string> = { [P in T]?: string };

export type sheetInfer<T extends SheetModel<string>> =
  T extends SheetModel<string, infer Inner> ? z.infer<Inner> : never;

export class SheetModel<
  T extends string,
  RSchema extends z.ZodType<object, Entity<T>> = z.ZodType<object, Entity<T>>,
> {
  private sheetName: string;
  private headers: T[];
  private headerIndexes: Map<T, number> | null = null;
  private positions = new WeakMap<z.infer<RSchema>, number>();
  private dataRowIndex = 2;
  private schema: RSchema;

  static fixed<T extends string, RSchema extends z.ZodType<object, Entity<T>>>(
    sheetName: string,
    headers: T[],
    schema: RSchema,
  ) {
    const model = new SheetModel(sheetName, headers, schema);
    model.headerIndexes = new Map<T, number>();
    for (const [index, header] of headers.entries()) {
      model.headerIndexes.set(header, index);
    }
    model.dataRowIndex = 1;
    return model;
  }

  constructor(sheetName: string, headers: T[], schema: RSchema) {
    this.sheetName = sheetName;
    this.headers = headers;
    this.schema = schema;
  }

  async fetchData() {
    const data = await this.fetchTable(this.sheetName);
    return this.map(data);
  }

  private map(data: string[][]) {
    // Ignore human-readable headers(the first row), because those can change any time
    // form is changed. Will use the second row to key the columns
    const headers = data[this.dataRowIndex - 1];
    if (headers == null) {
      throw new Error("Sheet is missing second header row");
    }
    const headerIndexes = this.mapHeaderIndexes(headers);

    return data
      .entries()
      .filter(([index]) => this.dataRowIndex <= index)
      .map(([index, row]) => {
        const dto: Entity<T> = {};
        for (const [header, index] of headerIndexes) {
          const value = row[index];
          dto[header] = value == "" ? undefined : value;
        }
        const parsed = this.schema.safeParse(dto);
        if (!parsed.success) {
          console.error("Error on row:", index + 1, "for table:", this.sheetName);
          throw parsed.error;
        } else {
          this.positions.set(parsed.data, index + 1);
          return parsed.data;
        }
      });
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
    return await sheetAccess.getValues(range);
  }

  async save(entity: z.infer<RSchema>) {
    console.log("SheetModel.save", entity);
    const position = this.positions.get(entity);
    if (position == null) {
      throw new Error("Trying to save an entity that has no saved position");
    }
    const row = await this.entityToRow(this.schema.encode(entity));
    await sheetAccess.update(`${this.sheetName}!${position}:${position}`, row);
  }

  async appendRow(entity: z.infer<RSchema>) {
    const row = await this.entityToRow(this.schema.encode(entity));
    sheetAccess.append(this.sheetName, row);
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
