export type Id<T extends string> = string & { __brand: T };

export type ColumnType = "text" | "number" | "boolean" | "select" | "date";

export interface ColumnOptions {
  selectOptions?: string[];
  dateFormat?: string;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  [key: string]: any;
}

export interface Column {
  id: Id<"vtableColumns">;
  name: string;
  type: ColumnType;
  options: ColumnOptions | null;
  order: number;
}

export interface CellData {
  id: Id<"vtableCells"> | null;
  value: any;
}

export interface Row {
  id: Id<"vtableRows">;
  createdAt: number;
  cells: Record<string, CellData>; // Column ID string -> CellData
}

export interface VTableData {
  table: {
    _id: Id<"vtables">;
    name: string;
    ownerId: string;
    createdAt: number;
    description: string | null;
  };
  columns: Column[];
  rows: Row[];
}

export interface UpdateCellInput {
  id: Id<"vtableCells"> | null;
  value: any;
  tableId: Id<"vtables">;
  rowId: Id<"vtableRows">;
  columnId: Id<"vtableColumns">;
}

export interface AddColumnInput {
  tableId: Id<"vtables">;
  name: string;
  type: ColumnType;
  options?: ColumnOptions;
}

export interface AddRowInput {
  tableId: Id<"vtables">;
}

export function getDefaultValueForType(type: ColumnType): any {
  switch (type) {
    case "text":
      return "";
    case "number":
      return 0;
    case "boolean":
      return false;
    case "select":
      return null;
    case "date":
      return new Date().toISOString().split("T")[0];
    default:
      return null;
  }
}
