import type { Column, Row, VTableData } from "../vtable-types";

/**
 * Transforms VTable data into a format compatible with TanStack Table
 * @param data The VTable data from Convex
 * @returns Data formatted for TanStack Table
 */
export function transformDataForTable(data: VTableData) {
  if (!data) return { columns: [], rows: [] };

  const { columns, rows } = data;

  const sortedColumns = [...columns].sort((a, b) => a.order - b.order);

  const tableColumns = sortedColumns.map((column) => ({
    id: column.id,
    accessorKey: column.id,
    header: column.name,
    type: column.type,
    options: column.options,
    cell: ({ getValue }: { getValue: () => any }) => {
      const value = getValue();
      return value?.value !== undefined ? value.value : null;
    },
  }));

  const tableRows = rows.map((row) => {
    const rowData: Record<string, any> = {
      id: row.id,
    };

    columns.forEach((column) => {
      rowData[column.id] = row.cells[column.id] || { id: null, value: null };
    });

    return rowData;
  });

  return {
    columns: tableColumns,
    rows: tableRows,
  };
}

/**
 * Extracts column definitions from TanStack Table format
 * @param tableData The transformed table data
 * @returns Array of column definitions
 */
export function extractColumnDefs(tableData: ReturnType<typeof transformDataForTable>) {
  return tableData.columns;
}

/**
 * Extracts row data from TanStack Table format
 * @param tableData The transformed table data
 * @returns Array of row data
 */
export function extractRowData(tableData: ReturnType<typeof transformDataForTable>) {
  return tableData.rows;
}
