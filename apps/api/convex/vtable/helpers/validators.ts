// Validation functions for VTable operations
import { VTableColumnType, ALLOWED_COLUMN_TYPES } from "./types";

/**
 * Validates if the provided column type is one of the allowed types.
 * Throws an error if the type is invalid.
 */
export function validateColumnType(
  type: string
): asserts type is VTableColumnType {
  if (!(ALLOWED_COLUMN_TYPES as readonly string[]).includes(type)) {
    throw new Error(
      `Invalid column type: ${type}. Allowed types are: ${ALLOWED_COLUMN_TYPES.join(
        ", "
      )}`
    );
  }
}

/**
 * Gets the default value (as a string or undefined) for a given column type.
 * This is used when creating new cells for a new column or row.
 */
export function getDefaultValueForType(
  type: VTableColumnType,
  options?: Record<string, any> | null
): string | undefined {
  // TODO: Add logic based on options if needed in the future
  switch (type) {
    case "text":
      return ""; // Default empty string for text
    case "number":
      return "0"; // Default "0" for number (stored as string)
    case "boolean":
      return "false"; // Default "false" for boolean (stored as string)
    default:
      // This should be unreachable due to validateColumnType, but belts and braces
      const exhaustiveCheck: never = type;
      throw new Error(`Unhandled column type: ${exhaustiveCheck}`);
  }
  // Removed old console logs and placeholder return
}
