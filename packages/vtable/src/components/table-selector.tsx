import React, { useState } from "react";
import { Button } from "@construct/ui";
import { ChevronDown, Plus } from "lucide-react";
import type { Id } from "../vtable-types";

interface TableSelectorProps {
  tables: Array<{
    _id: Id<"vtables">;
    name: string;
    description: string | null;
  }>;
  selectedTableId: Id<"vtables"> | null;
  onSelectTable: (tableId: Id<"vtables">) => void;
  onCreateTable?: () => void;
  isLoading?: boolean;
}

export function TableSelector({
  tables,
  selectedTableId,
  onSelectTable,
  onCreateTable,
  isLoading = false,
}: TableSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedTable = tables.find((table) => table._id === selectedTableId);

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <div className="relative w-64">
          <Button
            variant="outline"
            className="w-full justify-between"
            onClick={() => setIsOpen(!isOpen)}
            disabled={isLoading}
          >
            <span className="truncate">
              {isLoading
                ? "Loading..."
                : selectedTable?.name || "Select a table"}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
          {isOpen && (
            <div className="absolute top-full left-0 z-10 mt-1 w-full rounded-md border bg-background shadow-lg">
              <div className="max-h-60 overflow-auto py-1">
                {tables.length === 0 ? (
                  <div className="px-2 py-1 text-sm text-muted-foreground">
                    No tables found
                  </div>
                ) : (
                  tables.map((table) => (
                    <div
                      key={table._id}
                      className={`px-2 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground ${
                        table._id === selectedTableId
                          ? "bg-accent text-accent-foreground"
                          : ""
                      }`}
                      onClick={() => {
                        onSelectTable(table._id);
                        setIsOpen(false);
                      }}
                    >
                      <div className="font-medium">{table.name}</div>
                      {table.description && (
                        <div className="text-xs text-muted-foreground truncate">
                          {table.description}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        {onCreateTable && (
          <Button
            variant="outline"
            size="icon"
            onClick={onCreateTable}
            disabled={isLoading}
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
