import {
  DBDefinition,
  DEFINITIONS_TABLE_NAME,
  Definition,
  DefinitionCreate,
  DefinitionDelete,
  DefinitionRead,
  DefinitionUpdate,
  HeadWordDefinitionFind,
} from "../entities/definitions"
import { createId } from "@paralleldrive/cuid2"
import { parseParamsToSqlParams } from "app/utils/sqlParameterParser"
import { DBAPI, DBStatement } from "./base"
import {
  DBHeadWordDefinitionMapping,
  HEAD_WORD_DEFINITION_MAPPINGS_TABLE_NAME,
} from "../entities/headWordDefinitionMappings"
import { HEAD_WORDS_TABLE_NAME } from "../entities/headWords"
import {
  createHeadWordDefinitionMapping,
  deleteHeadWordDefinitionMapping,
  findHeadWordDefinitionMappingsByHeadWord,
  headWordDefinitionMapping,
} from "./headWordDefinitionMappings"
import { getHeadWord } from "./headWords"

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
      ORDER BY m.[order] DESC, m.[created_at] DESC;
    `
  }
  findDefinitionsByHeadWordContent(headWordContent: string) {
    return `
      SELECT d.*, m.[order] from ${this.tableName} d
      JOIN ${HEAD_WORD_DEFINITION_MAPPINGS_TABLE_NAME} m ON m.definition_id = d.id
      JOIN ${HEAD_WORDS_TABLE_NAME} h ON h.id = m.head_word_id
      WHERE h.content = '${headWordContent}'
      ORDER BY m.[order] DESC, m.[created_at] DESC;
    `
  }
}

export function dbDefinitionToDefinition(input: DBDefinition): Definition {
  const result = Object.entries(input).reduce((acc, [key, value]) => {
    if (Boolean(value) && (key === "created_at" || key === "updated_at" || key === "deleted_at")) {
      return { ...acc, [key]: new Date(value as string) }
    } else {
      return { ...acc, [key]: value }
    }
  }, {} as Definition)
  return result as Definition
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

export async function updateDefinitionsWithForm(
  db: DBAPI,
  data: { definitions: (Definition & { mappingId: string })[]; headWord: string },
) {
  // NOTE: List out current relationships
  const existingMappings = await findHeadWordDefinitionMappingsByHeadWord(db, {
    content: data.headWord,
  })
  const headWord = await getHeadWord(db, { content: data.headWord })
  const newDefinitions = data.definitions.filter((definition) => !definition.mappingId)
  const staleDefinitions = data.definitions.filter((definition) =>
    existingMappings.map((existingMapping) => existingMapping.id).includes(definition.mappingId),
  )
  const removingDefinitions = existingMappings.filter(
    (existingMapping) =>
      !data.definitions.map((definition) => definition.mappingId).includes(existingMapping.id),
  )
  // NOTE: Create new definitions
  try {
    await Promise.all(
      newDefinitions
        .map((newDefinition) =>
          Object.fromEntries(
            Object.entries(newDefinition).filter(([_, value]) => value !== undefined),
          ),
        )
        .map(async (newDefinition) => {
          const definition = await createDefinition(db, {
            ...newDefinition,
          })
          return createHeadWordDefinitionMapping(db, {
            head_word_id: headWord.id,
            definition_id: definition.id,
          })
        }),
    )

    // NOTE: Clean up removing definitions
    await Promise.all(
      removingDefinitions.map(async (removingDefinition) =>
        deleteHeadWordDefinitionMapping(db, { id: removingDefinition.id }),
      ),
    )

    // NOTE: Update stale definitions
    await Promise.all(
      staleDefinitions.map(async ({ mappingId, ...staleDefinition }) =>
        updateDefinition(db, { ...staleDefinition }),
      ),
    )
  } catch (e) {
    console.log(e)
  }
}

export async function deleteDefinition(db: DBAPI, { id }: DefinitionDelete) {
  return db.run(definitionStatementGeneartor.getDeleteStatement(), { $id: id })
}

export async function findDefinitionsByHeadWord(
  db: DBAPI,
  { content }: HeadWordDefinitionFind,
): Promise<Definition[]> {
  if (!content) return []
  const dbDefinitions = (await db.find(
    definitionStatementGeneartor.findDefinitionsByHeadWordContent(content),
  )) as DBDefinition[]
  return dbDefinitions.map((dbDefinition) => dbDefinitionToDefinition(dbDefinition))
}
