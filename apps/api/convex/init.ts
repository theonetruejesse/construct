import { api } from "./_generated/api";
import { type MutationCtx, internalMutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Message seed data
const seedMessages = [
  ["Omar", "Hey there!", 0],
  ["Arya", "What's up? Have a good weekend?", 1000],
  ["Omar", "Yeah! I spent most of it reading about AI :)", 1500],
  ["Arya", "Oh cool, I need to learn more about that!", 1700],
  [
    "Omar",
    "It would be great if we could chat here with an AI assistant",
    3000,
  ],
  ["Evelyn", "Hey folks! Ooh I like that idea", 2000],
  ["Arya", "Hi :) Yeah me too!", 1000],
  [
    "Evelyn",
    "I was playing with ChatGPT this weekend and I think we could hook it up to this app!",
    600,
  ],
  ["Omar", "Sounds like a plan", 5000],
] as const;

// VTable seed data
const defaultColumns = [
  { name: "Title", type: "text" },
  { name: "Status", type: "text" }, // Adapt from 'select' to 'text'
  { name: "Date", type: "text" }, // Adapt from 'date' to 'text'
  { name: "Priority", type: "text" }, // Adapt from 'select' to 'text'
];

const demoTables = [
  { name: "Project Tasks", ownerId: "demo-user" },
  { name: "Meeting Notes", ownerId: "demo-user" },
  { name: "Product Roadmap", ownerId: "demo-user" },
];

// Helper functions for VTable seeding
async function seedVTableData(ctx: MutationCtx) {
  console.log("Seeding VTable data...");

  // Create tables and columns
  for (const tableData of demoTables) {
    const tableId = await createTable(ctx, tableData);
    const columns = await createColumns(ctx, tableId, defaultColumns);
    await createRowsWithCells(ctx, tableId, columns);
  }
}

async function createTable(
  ctx: MutationCtx,
  tableData: { name: string; ownerId: string }
): Promise<Id<"vtables">> {
  return await ctx.db.insert("vtables", {
    name: tableData.name,
    ownerId: tableData.ownerId,
    createdAt: Date.now(),
    description: `Demo ${tableData.name} table`,
  });
}

interface ColumnDefinition {
  name: string;
  type: string;
  options?: Record<string, any>;
}

interface ColumnWithId {
  id: Id<"vtableColumns">;
  name: string;
  type: string;
  options: Record<string, any>;
}

async function createColumns(
  ctx: MutationCtx,
  tableId: Id<"vtables">,
  columnDefinitions: ColumnDefinition[]
): Promise<ColumnWithId[]> {
  const columns: ColumnWithId[] = [];

  for (let i = 0; i < columnDefinitions.length; i++) {
    const def = columnDefinitions[i];
    const columnId = await ctx.db.insert("vtableColumns", {
      tableId,
      name: def.name,
      type: def.type,
      options: def.options || {},
      order: i,
    });

    columns.push({
      id: columnId,
      name: def.name,
      type: def.type,
      options: def.options || {},
    });
  }

  return columns;
}

async function createRowsWithCells(
  ctx: MutationCtx,
  tableId: Id<"vtables">,
  columns: ColumnWithId[]
): Promise<void> {
  // Create 3-5 rows per table
  const rowCount = Math.floor(Math.random() * 3) + 3;

  for (let i = 0; i < rowCount; i++) {
    // Create row
    const rowId = await ctx.db.insert("vtableRows", {
      tableId,
      createdAt: Date.now(),
    });

    // Create cells with appropriate sample data
    for (const column of columns) {
      const value = getValueForCell(column, i, tableId);

      await ctx.db.insert("vtableCells", {
        rowId,
        columnId: column.id,
        value,
      });
    }
  }
}

function getValueForCell(
  column: ColumnWithId,
  rowIndex: number,
  tableId: Id<"vtables">
): string {
  // Generate appropriate values based on column type and table
  if (column.name === "Title") {
    const tableName =
      demoTables.find(
        (t) =>
          // Since we can't directly compare IDs, compare by name
          t.name ===
          demoTables.find(
            (dt, i) =>
              i ===
              demoTables.findIndex((dt) =>
                dt.name.includes(t.name.split(" ")[0])
              )
          )?.name
      )?.name || "";

    if (tableName.includes("Project")) {
      const tasks = [
        "Implement user authentication",
        "Design dashboard UI",
        "Set up CI/CD pipeline",
        "Write API documentation",
        "Fix navigation bug",
      ];
      return tasks[rowIndex % tasks.length];
    } else if (tableName.includes("Meeting")) {
      const meetings = [
        "Weekly standup",
        "Product review",
        "Sprint planning",
        "Retrospective",
        "Client presentation",
      ];
      return meetings[rowIndex % meetings.length];
    } else {
      const roadmapItems = [
        "User profile feature",
        "Payment integration",
        "Mobile app release",
        "Analytics dashboard",
        "Performance optimization",
      ];
      return roadmapItems[rowIndex % roadmapItems.length];
    }
  } else if (column.name === "Status") {
    const statuses = ["To Do", "In Progress", "Done"];
    return statuses[rowIndex % statuses.length];
  } else if (column.name === "Date") {
    const date = new Date();
    date.setDate(date.getDate() + rowIndex * 5);
    return date.toISOString().split("T")[0];
  } else if (column.name === "Priority") {
    const priorities = ["Low", "Medium", "High"];
    return priorities[rowIndex % priorities.length];
  }

  // Default to empty string for other columns
  return "";
}

export default internalMutation({
  handler: async (ctx: MutationCtx) => {
    console.log("Initializing database...");

    // Check for existing messages
    const anyMessage = await ctx.db.query("messages").first();
    if (!anyMessage) {
      console.log("Seeding messages...");
      // Seed messages (existing logic)
      let totalDelay = 0;
      for (const [author, body, delay] of seedMessages) {
        totalDelay += delay;
        await ctx.scheduler.runAfter(totalDelay, api.messages.send, {
          author,
          text: body,
        });
      }
    }

    // Check for existing VTable data
    const anyVTable = await ctx.db.query("vtables").first();
    if (!anyVTable) {
      // Seed VTable data
      await seedVTableData(ctx);
    }
  },
});
