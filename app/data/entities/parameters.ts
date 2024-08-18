import { createId } from "@paralleldrive/cuid2"
import { DBTimestampBase, TimestampBase } from "./base"
import { FSRSParameters, generatorParameters } from "ts-fsrs"

export const PARAMETERS_TABLE_NAME = "parameters"

export type DBParameters = DBTimestampBase & {
  request_retention: number
  maximum_interval: number
  w: number[]
  enable_fuzz: number
  enable_short_term: number
}

export type Parameters = TimestampBase & {
  request_retention: number
  maximum_interval: number
  w: number[]
  enable_fuzz: boolean
  enable_short_term: boolean
}

export type ParametersCreate = Partial<Parameters>
export type ParametersRead = Partial<Parameters>
export type ParametersUpdate = Partial<Parameters> & Pick<Parameters, "id">
export type ParametersDelete = Pick<Parameters, "id">

export const PARAMETERS_DDL = `
  CREATE TABLE "${PARAMETERS_TABLE_NAME}" (
    "id" TEXT PRIMARY KEY NOT NULL,
    "request_retention" REAL DEFAULT 0.9 NOT NULL,
    "maximum_interval" INTEGER DEFAULT 36500 NOT NULL,
    "w" BLOB NOT NULL,
    "enable_fuzz" INTEGER DEFAULT 0 NOT NULL,
    "enable_short_term" INTEGER DEFAULT 1 NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT (STRFTIME('%FT%R:%fZ','NOW')),
    "updated_at" DATETIME NOT NULL DEFAULT (STRFTIME('%FT%R:%fZ','NOW')),
    "deleted_at" DATETIME
  );
`

const params: FSRSParameters = generatorParameters()

export const PARAMETERS_SEED_STATEMENT = `
  INSERT INTO ${PARAMETERS_TABLE_NAME} (id, w) 
  VALUES ('${createId()}', '[${params.w}]');
`
