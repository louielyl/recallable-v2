import { SQLiteDatabase } from "expo-sqlite"
import {
  DBDefinition,
  DefinitionCreate,
  DefinitionDelete,
  DefinitionRead,
  DefinitionUpdate,
} from "../entities/definition"
import { createId } from "@paralleldrive/cuid2"
import { parseParamsToSqlParams } from "app/utils/sqlParameterParser"

export async function createDefinition(
  db: SQLiteDatabase,
  { id = createId(), content, language, ...params }: DefinitionCreate,
): Promise<DBDefinition> {
  const hasParams = Object.keys(params).length !== 0
  const parsedParams = parseParamsToSqlParams(params)
  let result = await db.runAsync(
    `
      INSERT INTO definitions (id, content, language${hasParams ? ", " : ""}
      ${Object.keys(params).toString()}) 
      VALUES ($id, $content, $language${hasParams ? ", " : ""}
      ${Object.keys(parsedParams).toString()})
    `,
    {
      $id: id,
      $content: content,
      $language: language,
      ...parsedParams,
    },
  )

  return db.getFirstAsync(`SELECT * from definitions WHERE rowid = $rowid`, {
    $rowid: result.lastInsertRowId,
  }) as Promise<DBDefinition>
}

export async function findDefinition(db: SQLiteDatabase): Promise<DBDefinition[]> {
  return db.getAllAsync(`SELECT * from definitions`)
}

export async function getDefinition(
  db: SQLiteDatabase,
  { id }: DefinitionRead,
): Promise<DBDefinition> {
  return db.getFirstAsync(`SELECT * from definitions WHERE id = $id`, {
    $id: id,
  }) as Promise<DBDefinition>
}

export async function updateDefinition(
  db: SQLiteDatabase,
  { id, ...params }: DefinitionUpdate,
): Promise<DBDefinition> {
  const parsedParams = parseParamsToSqlParams(params)
  await db.runAsync(
    `
      UPDATE definitions SET 
      (${Object.keys(params).toString()}) = 
      (${Object.keys(parsedParams).toString()})
      WHERE id = $id
    `,
    {
      $id: id,
      ...parsedParams,
    },
  )

  return getDefinition(db, { id: id })
}

export async function deleteDefinition(db: SQLiteDatabase, { id }: DefinitionDelete) {
  return db.runAsync(`DELETE FROM definitions WHERE id = $id`, { $id: id })
}
