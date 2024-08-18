import { createId } from "@paralleldrive/cuid2"
import {
  DBParameters,
  PARAMETERS_TABLE_NAME,
  Parameters,
  ParametersCreate,
  ParametersDelete,
  ParametersRead,
  ParametersUpdate,
} from "../entities/parameters"
import { DBAPI, DBStatement } from "./base"
import { parseParamsToSqlParams } from "app/utils/sqlParameterParser"

class ParametersStatement extends DBStatement {
  constructor(tableName: string) {
    super(tableName)
  }
  getLastParametersStatement() {
    return `
      SELECT * FROM ${PARAMETERS_TABLE_NAME} ORDER BY created_at DESC LIMIT 1;
    `
  }
}

const parameters = new ParametersStatement(PARAMETERS_TABLE_NAME)

export async function createParameters(
  db: DBAPI,
  { id = createId(), ...params }: ParametersCreate,
): Promise<DBParameters> {
  await db.run(parameters.getInsertStatement(params), {
    $id: id,
    ...parseParamsToSqlParams(params),
  })

  return db.get(parameters.getSelectStatement(), {
    $id: id,
  }) as Promise<DBParameters>
}

export async function findParameters(db: DBAPI): Promise<DBParameters[]> {
  return db.find(parameters.getSelectAllStatement())
}

export async function getParameters(db: DBAPI, { id }: ParametersRead): Promise<Parameters> {
  if (id) {
    return db.get(parameters.getSelectStatement(), {
      $id: id,
    }) as Promise<Parameters>
  } else {
    return db.get(parameters.getLastParametersStatement()) as Promise<Parameters>
  }
}

export async function updateParameters(
  db: DBAPI,
  { id, ...params }: ParametersUpdate,
): Promise<DBParameters> {
  const record = (await db.get(parameters.getSelectStatement(), {
    $id: id,
  })) as DBParameters

  await db.run(parameters.getUpdateStatement(record), {
    $id: id,
    ...parseParamsToSqlParams(record),
    ...parseParamsToSqlParams(params),
  })

  return db.get(parameters.getSelectStatement(), {
    $id: id,
  }) as Promise<DBParameters>
}

export async function deleteParameters(db: DBAPI, { id }: ParametersDelete) {
  return db.run(parameters.getDeleteStatement(), { $id: id })
}
