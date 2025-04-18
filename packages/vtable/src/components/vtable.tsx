import React, { useMemo, useState, useCallback } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { useVTable } from "../state/vtable-context";
import { transformDataForTable } from "../utils/data-transform";
import type { VTableData, UpdateCellInput, Id } from "../vtable-types";
import { Button } from "@construct/ui";
import { Plus } from "lucide-react";

interface VTableProps {
  data: VTableData;
  isLoading?: boolean;
  onAddRow?: () => void;
  onAddColumn?: () => void;
  onUpdateCell?: (input: UpdateCellInput) => void;
}

export function VTable({
  data,
  isLoading = false,
  onAddRow,
  onAddColumn,
  onUpdateCell,
}: VTableProps) {
  const { refreshCounter } = useVTable();
  const [editingCell, setEditingCell] = useState<{
    rowId: string;
    columnId: string;
  } | null>(null);

  const tableData = useMemo(() => transformDataForTable(data), [data, refreshCounter]);

  const columns = useMemo<ColumnDef<any>[]>(
    () => tableData.columns,
    [tableData.columns]
  );

  const table = useReactTable({
    data: tableData.rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleCellClick = useCallback(
    (rowId: string, columnId: string) => {
      setEditingCell({ rowId, columnId });
    },
    []
  );

  const handleCellChange = useCallback(
    (rowId: string, columnId: string, value: any, cellId: string | null) => {
      if (onUpdateCell) {
        onUpdateCell({
          id: cellId as any, // Type cast to match the expected Id type
          value,
          tableId: data.table._id,
          rowId: rowId as any, // Type cast to match the expected Id type
          columnId: columnId as any, // Type cast to match the expected Id type
        });
      }
      setEditingCell(null);
    },
    [onUpdateCell, data.table._id]
  );

  const renderCell = useCallback(
    (cell: any, row: any) => {
      const columnId = cell.column.id;
      const rowId = row.id;
      const cellData = row[columnId];
      const isEditing =
        editingCell?.rowId === rowId && editingCell?.columnId === columnId;

      const column = data.columns.find((col) => col.id === columnId);
      if (!column) return null;

      if (isEditing) {
        return (
          <CellEditor
            type={column.type}
            options={column.options}
            value={cellData?.value}
            onSave={(value) => handleCellChange(rowId, columnId, value, cellData?.id)}
            onCancel={() => setEditingCell(null)}
          />
        );
      }

      return (
        <div
          className="p-2 cursor-pointer h-full w-full"
          onClick={() => handleCellClick(rowId, columnId)}
        >
          {formatCellValue(cellData?.value, column.type)}
        </div>
      );
    },
    [data.columns, editingCell, handleCellChange, handleCellClick]
  );

  return (
    <div className="w-full overflow-auto">
      {isLoading ? (
        <div className="flex justify-center items-center h-40">Loading...</div>
      ) : (
        <>
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-bold">{data.table.name}</h2>
            <div className="flex gap-2">
              {onAddColumn && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onAddColumn}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Column
                </Button>
              )}
              {onAddRow && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onAddRow}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Row
                </Button>
              )}
            </div>
          </div>

          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="border-b px-4 py-2 text-left font-medium"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-b">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-2">
                        {renderCell(cell, row.original)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

interface CellEditorProps {
  type: string;
  options: any;
  value: any;
  onSave: (value: any) => void;
  onCancel: () => void;
}

function CellEditor({ type, options, value, onSave, onCancel }: CellEditorProps) {
  const [currentValue, setCurrentValue] = useState(value);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSave(currentValue);
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  switch (type) {
    case "text":
      return (
        <input
          type="text"
          className="w-full p-1 border rounded"
          value={currentValue || ""}
          onChange={(e) => setCurrentValue(e.target.value)}
          onBlur={() => onSave(currentValue)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      );
    case "number":
      return (
        <input
          type="number"
          className="w-full p-1 border rounded"
          value={currentValue ?? ""}
          min={options?.min}
          max={options?.max}
          step={options?.step || 1}
          onChange={(e) => setCurrentValue(Number(e.target.value))}
          onBlur={() => onSave(currentValue)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      );
    case "boolean":
      return (
        <select
          className="w-full p-1 border rounded"
          value={currentValue ? "true" : "false"}
          onChange={(e) => setCurrentValue(e.target.value === "true")}
          onBlur={() => onSave(currentValue)}
          onKeyDown={handleKeyDown}
          autoFocus
        >
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      );
    case "select":
      return (
        <select
          className="w-full p-1 border rounded"
          value={currentValue || ""}
          onChange={(e) => setCurrentValue(e.target.value)}
          onBlur={() => onSave(currentValue)}
          onKeyDown={handleKeyDown}
          autoFocus
        >
          <option value="">Select...</option>
          {options?.selectOptions?.map((option: string) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    case "date":
      return (
        <input
          type="date"
          className="w-full p-1 border rounded"
          value={currentValue || ""}
          onChange={(e) => setCurrentValue(e.target.value)}
          onBlur={() => onSave(currentValue)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      );
    default:
      return (
        <input
          type="text"
          className="w-full p-1 border rounded"
          value={currentValue || ""}
          onChange={(e) => setCurrentValue(e.target.value)}
          onBlur={() => onSave(currentValue)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      );
  }
}

function formatCellValue(value: any, type: string): React.ReactNode {
  if (value === null || value === undefined) return "";

  switch (type) {
    case "boolean":
      return value ? "Yes" : "No";
    case "date":
      return value; // Could add date formatting here
    default:
      return String(value);
  }
}
