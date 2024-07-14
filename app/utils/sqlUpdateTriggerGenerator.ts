import { createId } from "@paralleldrive/cuid2"

export function getUpdateTriggerStatement(table: string) {
  return `
    CREATE TRIGGER ${table}_updated_at_trigger_${createId()}
    AFTER UPDATE on ${table}
    BEGIN
      UPDATE ${table} SET updated_at = DATETIME('NOW') WHERE id = NEW.id;
    END
  `
}
