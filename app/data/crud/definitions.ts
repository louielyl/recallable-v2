import {
  DBDefinition,
  DEFINITIONS_TABLE_NAME,
  DefinitionCreate,
  DefinitionDelete,
  DefinitionRead,
  DefinitionUpdate,
} from "../entities/definitions"
import { createId } from "@paralleldrive/cuid2"
import { parseParamsToSqlParams } from "app/utils/sqlParameterParser"
import { DBAPI, DBStatement } from "./base"
import { HEAD_WORD_DEFINITION_MAPPINGS_TABLE_NAME } from "../entities/headWordDefinitionMappings"
import { HEAD_WORDS_TABLE_NAME } from "../entities/headWords"

class DefinitionStatement extends DBStatement {
  constructor(tableName: string) {
    super(tableName)
  }
  findDefinitionsByHeadWordId(headWordId: string) {
    return `
      SELECT d.*, m.[order] from ${this.tableName} d
      JOIN ${HEAD_WORD_DEFINITION_MAPPINGS_TABLE_NAME} m ON m.definition_id = d.id
      JOIN ${HEAD_WORDS_TABLE_NAME} h ON h.id = m.head_word_id
      WHERE h.id = '${headWordId}'
      ORDER BY m.[order] DESC, m.[created_at] DESC
    `
  }
}

export const definitionStatementGeneartor = new DefinitionStatement(DEFINITIONS_TABLE_NAME)

export async function createDefinition(
  db: DBAPI,
  { id = createId(), ...params }: DefinitionCreate,
): Promise<DBDefinition> {
  await db.run(definitionStatementGeneartor.getInsertStatement(params), {
    $id: id,
    ...parseParamsToSqlParams(params),
  })

  return db.get(definitionStatementGeneartor.getSelectStatement(), {
    $id: id,
  }) as Promise<DBDefinition>
}

export async function findDefinitions(db: DBAPI): Promise<DBDefinition[]> {
  return db.find(definitionStatementGeneartor.getSelectAllStatement())
}

export async function getDefinition(db: DBAPI, { id }: DefinitionRead): Promise<DBDefinition> {
  return db.get(definitionStatementGeneartor.getSelectStatement(), {
    $id: id,
  }) as Promise<DBDefinition>
}

export async function updateDefinition(
  db: DBAPI,
  { id, ...params }: DefinitionUpdate,
): Promise<DBDefinition> {
  const record = (await db.get(definitionStatementGeneartor.getSelectStatement(), {
    $id: id,
  })) as DBDefinition

  await db.run(definitionStatementGeneartor.getUpdateStatement(record), {
    $id: id,
    ...parseParamsToSqlParams(record),
    ...parseParamsToSqlParams(params),
  })

  return db.get(definitionStatementGeneartor.getSelectStatement(), {
    $id: id,
  }) as Promise<DBDefinition>
}

export async function deleteDefinition(db: DBAPI, { id }: DefinitionDelete) {
  return db.run(definitionStatementGeneartor.getDeleteStatement(), { $id: id })
}
