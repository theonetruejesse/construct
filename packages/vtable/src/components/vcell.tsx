"use client";

import React, { useState } from "react";
import { Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@construct/ui";
import { format } from "date-fns";
import type { CellData, Column } from "../vtable-types";
import { Checkbox } from "./checkbox";

interface VCellProps {
  cell: CellData;
  column: Column;
  isEditing: boolean;
  onStartEdit: () => void;
  onSave: (value: any) => void;
  onCancel: () => void;
}

export function VCell({ cell, column, isEditing, onStartEdit, onSave, onCancel }: VCellProps) {
  const [editValue, setEditValue] = useState<any>(cell.value);
  
  type CheckedState = boolean;
  
  const handleDoubleClick = () => {
    if (!isEditing) {
      onStartEdit();
    }
  };

  const handleSave = () => {
    onSave(editValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  const renderDisplay = () => {
    switch (column.type) {
      case "boolean":
        return (
          <div className="flex items-center justify-center h-full">
            <Checkbox checked={!!cell.value} disabled />
          </div>
        );
      case "date":
        return cell.value ? format(new Date(cell.value as string), "MMM d, yyyy") : "";
      case "select":
        return cell.value;
      case "number":
        return cell.value !== null && cell.value !== undefined ? cell.value : "";
      case "text":
      default:
        return cell.value !== null && cell.value !== undefined ? String(cell.value) : "";
    }
  };

  const renderEditor = () => {
    switch (column.type) {
      case "boolean":
        return (
          <div className="flex items-center justify-center h-full">
            <Checkbox 
              checked={!!editValue} 
              onCheckedChange={(checked) => setEditValue(!!checked)}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              autoFocus
            />
          </div>
        );
      case "date":
        return (
          <Input
            type="date"
            value={editValue ? new Date(editValue as string).toISOString().split("T")[0] : ""}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            autoFocus
            className="w-full h-full"
          />
        );
      case "select":
        return (
          <Select 
            value={editValue as string} 
            onValueChange={(value) => {
              setEditValue(value);
              setTimeout(handleSave, 100);
            }}
          >
            <SelectTrigger className="w-full h-full">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {column.options?.selectOptions?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "number":
        return (
          <Input
            type="number"
            value={editValue !== null && editValue !== undefined ? String(editValue) : ""}
            onChange={(e) => {
              const value = e.target.value === "" ? null : Number(e.target.value);
              setEditValue(value);
            }}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            autoFocus
            className="w-full h-full"
            min={column.options?.min}
            max={column.options?.max}
          />
        );
      case "text":
      default:
        return (
          <Input
            type="text"
            value={editValue !== null && editValue !== undefined ? String(editValue) : ""}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            autoFocus
            className="w-full h-full"
          />
        );
    }
  };

  return (
    <div 
      className={`h-full w-full p-2 ${isEditing ? "" : "cursor-pointer"}`}
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? renderEditor() : renderDisplay()}
    </div>
  );
}
