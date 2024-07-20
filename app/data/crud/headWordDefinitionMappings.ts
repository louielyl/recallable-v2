import {
  DBHeadWordDefinitionMapping,
  HEAD_WORD_DEFINITION_MAPPINGS_TABLE_NAME,
  HeadWordDefinitionMappingCreate,
  HeadWordDefinitionMappingDelete,
  HeadWordDefinitionMappingFind,
} from "../entities/headWordDefinitionMappings"
import { createId } from "@paralleldrive/cuid2"
import { parseParamsToSqlParams } from "app/utils/sqlParameterParser"
import { DBAPI, DBStatement } from "./base"
import { HEAD_WORDS_TABLE_NAME } from "../entities/headWords"

class HeadWordDefinitionMappingStatement extends DBStatement {
  constructor(tableName: string) {
    super(tableName)
  }
  getSelectAllByHeadWordStatement() {
    return `
      SELECT * FROM ${this.tableName} 
      JOIN ${HEAD_WORDS_TABLE_NAME} ON ${this.tableName}.head_word_id = ${HEAD_WORDS_TABLE_NAME}.id
      WHERE content = $content
    `
  }
}

const headWordDefinitionMapping = new HeadWordDefinitionMappingStatement(
  HEAD_WORD_DEFINITION_MAPPINGS_TABLE_NAME,
)

export async function createHeadWordDefinitionMapping(
  db: DBAPI,
  { id = createId(), ...params }: HeadWordDefinitionMappingCreate,
): Promise<DBHeadWordDefinitionMapping> {
  await db.run(headWordDefinitionMapping.getInsertStatement(params), {
    $id: id,
    ...parseParamsToSqlParams(params),
  })

  return db.get(headWordDefinitionMapping.getSelectStatement(), {
    $id: id,
  }) as Promise<DBHeadWordDefinitionMapping>
}

export async function findHeadWordDefinitionMappingsByHeadWord(
  db: DBAPI,
  params: HeadWordDefinitionMappingFind,
): Promise<DBHeadWordDefinitionMapping> {
  return db.find(headWordDefinitionMapping.getSelectAllByHeadWordStatement(), {
    ...parseParamsToSqlParams(params),
  }) as Promise<DBHeadWordDefinitionMapping>
}

export async function deleteHeadWordDefinitionMapping(
  db: DBAPI,
  { id }: HeadWordDefinitionMappingDelete,
) {
  return db.run(headWordDefinitionMapping.getDeleteStatement(), { $id: id })
}
