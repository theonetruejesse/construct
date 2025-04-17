export const api = {
  vtable: {
    tables: {
      createVTable: "vtable/tables:createVTable",
      deleteTable: "vtable/tables:deleteTable",
      updateTable: "vtable/tables:updateTable"
    },
    columns: {
      createVTableColumn: "vtable/columns:createVTableColumn",
      deleteColumn: "vtable/columns:deleteColumn",
      updateColumn: "vtable/columns:updateColumn"
    },
    rows: {
      createRow: "vtable/rows:createRow",
      deleteRow: "vtable/rows:deleteRow"
    },
    cells: {
      updateCell: "vtable/cells:updateCell"
    },
    queries: {
      getVTable: "vtable/queries:getVTable",
      listVTables: "vtable/queries:listVTables"
    }
  }
};
