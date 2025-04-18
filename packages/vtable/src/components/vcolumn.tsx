"use client";

import React from "react";
import { Button } from "@construct/ui";
import { Edit, Trash } from "lucide-react";
import type { Column } from "../vtable-types";

interface VColumnProps {
  column: Column;
  onEdit: (columnId: string) => void;
  onDelete: (columnId: string) => void;
}

export function VColumn({ column, onEdit, onDelete }: VColumnProps) {
  const handleEdit = () => {
    onEdit(column.id);
  };

  const handleDelete = () => {
    onDelete(column.id);
  };

  const getColumnTypeLabel = (type: string) => {
    switch (type) {
      case "text":
        return "Text";
      case "number":
        return "Number";
      case "boolean":
        return "Boolean";
      case "select":
        return "Select";
      case "date":
        return "Date";
      default:
        return type;
    }
  };

  return (
    <div className="flex items-center justify-between p-2 border-b">
      <div className="flex-1">
        <h3 className="font-medium">{column.name}</h3>
        <p className="text-sm text-gray-500">{getColumnTypeLabel(column.type)}</p>
      </div>
      <div className="flex space-x-2">
        <Button variant="ghost" size="sm" onClick={handleEdit}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={handleDelete}>
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
