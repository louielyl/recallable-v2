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
import { DBDefinition, Definition } from "../entities/definitions"
import { dbDefinitionToDefinition, definitionStatementGeneartor } from "./definitions"

class HeadWordDefinitionMappingStatement extends DBStatement {
  constructor(tableName: string) {
    super(tableName)
  }
  getSelectAllByHeadWordStatement() {
    return `
      SELECT m.* FROM ${this.tableName} m
      JOIN ${HEAD_WORDS_TABLE_NAME} ON m.head_word_id = ${HEAD_WORDS_TABLE_NAME}.id
      WHERE content = $content
    `
  }
}

export const headWordDefinitionMapping = new HeadWordDefinitionMappingStatement(
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
): Promise<(DBHeadWordDefinitionMapping & { definition: Definition })[]> {
  const mappings = (await db.find(headWordDefinitionMapping.getSelectAllByHeadWordStatement(), {
    ...parseParamsToSqlParams(params),
  })) as DBHeadWordDefinitionMapping[]
  return Promise.all(
    mappings.map(async (mapping) => {
      const dbDefinition: DBDefinition = await db.get(
        definitionStatementGeneartor.getSelectStatement(),
        { $id: mapping.definition_id },
      )
      const definition = dbDefinitionToDefinition(dbDefinition)
      return { ...mapping, definition }
    }),
  )
}

export async function deleteHeadWordDefinitionMapping(
  db: DBAPI,
  { id }: HeadWordDefinitionMappingDelete,
) {
  return db.run(headWordDefinitionMapping.getDeleteStatement(), { $id: id })
}
