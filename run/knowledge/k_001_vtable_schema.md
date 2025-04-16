# VTable Schema from mcp-vtable

**Confidence:** 0.9

**Sources:**

- mcp-vtable/packages/database/prisma/schema/vtables.prisma

**Summary:**
The VTable schema in mcp-vtable consists of four main models: v_tables, v_columns, v_rows, and v_cells. This structure represents a flexible virtual table system where:

- v_tables defines the virtual table with name and owner
- v_columns defines the columns of a table with name, type, and options
- v_rows defines the rows of a table
- v_cells stores the actual cell values, connecting rows and columns

---

The schema uses a relational structure with the following models:

1. **v_tables**:

   - id: Int (primary key)
   - name: String
   - owner_id: String? (UUID, optional)
   - created_at: DateTime
   - Relations: has many v_columns and v_rows, belongs to users

2. **v_columns**:

   - id: Int (primary key)
   - table_id: Int (foreign key to v_tables)
   - name: String
   - type: v_column_type (enum)
   - options: Json? (defaults to "{}")
   - Relations: belongs to v_tables, has many v_cells

3. **v_column_type** (Enum):

   - text
   - number
   - date
   - boolean
   - select
   - relation

4. **v_rows**:

   - id: Int (primary key)
   - table_id: Int (foreign key to v_tables)
   - created_at: DateTime
   - Relations: belongs to v_tables, has many v_cells

5. **v_cells**:
   - id: Int (primary key)
   - row_id: Int (foreign key to v_rows)
   - column_id: Int (foreign key to v_columns)
   - value: String? (can be null, represents the cell value)
   - Relations: belongs to v_rows and v_columns
