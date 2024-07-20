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

class DefinitionStatement extends DBStatement {
  constructor(tableName: string) {
    super(tableName)
  }
}

const definition = new DefinitionStatement(DEFINITIONS_TABLE_NAME)

export async function createDefinition(
  db: DBAPI,
  { id = createId(), ...params }: DefinitionCreate,
): Promise<DBDefinition> {
  await db.run(definition.getInsertStatement(params), {
    $id: id,
    ...parseParamsToSqlParams(params),
  })

  return db.get(definition.getSelectStatement(), {
    $id: id,
  }) as Promise<DBDefinition>
}

export async function findDefinitions(db: DBAPI): Promise<DBDefinition[]> {
  return db.find(definition.getSelectAllStatement())
}

export async function getDefinition(db: DBAPI, { id }: DefinitionRead): Promise<DBDefinition> {
  return db.get(definition.getSelectStatement(), {
    $id: id,
  }) as Promise<DBDefinition>
}

export async function updateDefinition(
  db: DBAPI,
  { id, ...params }: DefinitionUpdate,
): Promise<DBDefinition> {
  const record = (await db.get(definition.getSelectStatement(), {
    $id: id,
  })) as DBDefinition

  await db.run(definition.getUpdateStatement(record), {
    $id: id,
    ...parseParamsToSqlParams(record),
    ...parseParamsToSqlParams(params),
  })

  return db.get(definition.getSelectStatement(), {
    $id: id,
  }) as Promise<DBDefinition>
}

export async function deleteDefinition(db: DBAPI, { id }: DefinitionDelete) {
  return db.run(definition.getDeleteStatement(), { $id: id })
}
