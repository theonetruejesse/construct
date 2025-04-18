"use client";

import React from "react";
import { Button } from "@construct/ui";
import { Trash } from "lucide-react";
import type { Row, Column } from "../vtable-types";
import { VCell } from "./vcell";

interface VRowProps {
  row: Row;
  columns: Column[];
  onDeleteRow: (rowId: string) => void;
  onUpdateCell: (rowId: string, columnId: string, value: any) => void;
}

export function VRow({ row, columns, onDeleteRow, onUpdateCell }: VRowProps) {
  const [editingCell, setEditingCell] = React.useState<string | null>(null);

  const handleDeleteRow = () => {
    onDeleteRow(row.id);
  };

  const handleStartEdit = (columnId: string) => {
    setEditingCell(columnId);
  };

  const handleSaveCell = (columnId: string, value: any) => {
    onUpdateCell(row.id, columnId, value);
    setEditingCell(null);
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
  };

  return (
    <div className="flex items-center border-b">
      {columns.map((column) => {
        const cell = row.cells[column.id] || { id: null, value: null };
        const isEditing = editingCell === column.id;

        return (
          <div key={column.id} className="flex-1 p-2 border-r">
            <VCell
              cell={cell}
              column={column}
              isEditing={isEditing}
              onStartEdit={() => handleStartEdit(column.id)}
              onSave={(value) => handleSaveCell(column.id, value)}
              onCancel={handleCancelEdit}
            />
          </div>
        );
      })}
      <div className="p-2">
        <Button variant="ghost" size="sm" onClick={handleDeleteRow}>
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
