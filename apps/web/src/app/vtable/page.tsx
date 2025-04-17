"use client";

import React, { useState } from "react";
import { 
  VTable, 
  TableSelector, 
  useVTables, 
  useVTableData, 
  useCreateVTable, 
  useUpdateCell, 
  useAddColumn, 
  useAddRow, 
  VTableProvider,
  type Id
} from "@construct/vtable";
import { Button } from "@construct/ui";
import { Plus } from "lucide-react";

export default function VTablePage() {
  const [selectedTableId, setSelectedTableId] = useState<Id<"vtables"> | null>(null);
  const { data: tables, isLoading: isLoadingTables } = useVTables();
  const { data: tableData, isLoading: isLoadingTable } = useVTableData(selectedTableId);
  const createTable = useCreateVTable();
  const updateCell = useUpdateCell();
  const addColumn = useAddColumn();
  const addRow = useAddRow();

  const handleCreateTable = async () => {
    const name = prompt("Enter table name:");
    if (!name) return;
    
    const description = prompt("Enter table description (optional):");
    const tableId = await createTable(name, description || undefined);
    setSelectedTableId(tableId);
  };

  const handleAddColumn = async () => {
    if (!tableData) return;
    
    const name = prompt("Enter column name:");
    if (!name) return;
    
    const typeOptions: Array<"text" | "number" | "boolean" | "select" | "date"> = ["text", "number", "boolean", "select", "date"];
    const typeIndex = parseInt(prompt(`Select column type (0-${typeOptions.length - 1}):\n${typeOptions.map((t, i) => `${i}: ${t}`).join("\n")}`) || "0");
    const type = typeOptions[typeIndex] || "text";
    
    let options: any = null;
    if (type === "number") {
      const min = parseInt(prompt("Enter minimum value (optional):") || "");
      const max = parseInt(prompt("Enter maximum value (optional):") || "");
      options = { min: isNaN(min) ? undefined : min, max: isNaN(max) ? undefined : max };
    } else if (type === "select") {
      const optionsStr = prompt("Enter options separated by commas:");
      options = { selectOptions: optionsStr ? optionsStr.split(",").map(o => o.trim()) : [] };
    }
    
    await addColumn({
      tableId: tableData.table._id,
      name,
      type: type as "text" | "number" | "boolean" | "select" | "date",
      options
    });
  };

  const handleAddRow = async () => {
    if (!tableData) return;
    
    await addRow({
      tableId: tableData.table._id
    });
  };

  const handleUpdateCell = async (input: any) => {
    await updateCell(input);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">VTable Demo</h1>
      
      <div className="flex items-center gap-4 mb-8">
        <TableSelector 
          tables={tables || []} 
          selectedTableId={selectedTableId} 
          onSelectTable={setSelectedTableId}
          isLoading={isLoadingTables}
        />
        
        <Button onClick={handleCreateTable}>
          <Plus className="h-4 w-4 mr-1" />
          Create Table
        </Button>
      </div>
      
      {selectedTableId && tableData ? (
        <VTable 
          data={tableData}
          isLoading={isLoadingTable}
          onAddColumn={handleAddColumn}
          onAddRow={handleAddRow}
          onUpdateCell={handleUpdateCell}
        />
      ) : (
        <div className="text-center p-12 border rounded-md">
          {selectedTableId ? (
            <p>Loading table data...</p>
          ) : (
            <p>Select a table or create a new one to get started</p>
          )}
        </div>
      )}
    </div>
  );
}
