import { DBTimestampBase, TimestampBase } from "entities/base"
import { DBHeadWord, HeadWord } from "entities/headWord"
import { DBDefinition, DEFINITIONS_TABLE_NAME } from "./definitions"
import { HEAD_WORDS_TABLE_NAME } from "./headWords"

export type DBHeadWordDefinitionMapping = DBTimestampBase & {
  head_word_id: string
  definition_id: string
}

export type DBHeadWordDefinitionMappingFind = DBTimestampBase & {
  head_word_id: string
  definition_id: string
  head_word: DBHeadWord
  definitions: DBDefinition[]
}

export type HeadWordDefinitionMapping = TimestampBase & {
  head_word_id: string
  definition_id: string
}

export type HeadWordDefinitionMappingCreate = Partial<HeadWordDefinitionMapping> &
  Pick<HeadWordDefinitionMapping, "head_word_id" | "definition_id">
export type HeadWordDefinitionMappingFind = Pick<HeadWord, "content">
export type HeadWordDefinitionMappingUpdate = Partial<HeadWordDefinitionMapping> &
  Pick<HeadWordDefinitionMapping, "id">
export type HeadWordDefinitionMappingDelete = Pick<HeadWordDefinitionMapping, "id">

export const HEAD_WORD_DEFINITION_MAPPINGS_TABLE_NAME = "head_word_definition_mappings"

export const HEAD_WORD_DEFINITION_MAPPINGS_DDL = `
  CREATE TABLE "head_word_definition_mappings" (
    "id" TEXT PRIMARY KEY NOT NULL,
    "head_word_id" TEXT NOT NULL,
    "definition_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT (DATETIME('NOW')),
    "updated_at" DATETIME NOT NULL DEFAULT (DATETIME('NOW')),
    "deleted_at" DATETIME,
    FOREIGN KEY(head_word_id) REFERENCES ${HEAD_WORDS_TABLE_NAME}(id),
    FOREIGN KEY(definition_id) REFERENCES ${DEFINITIONS_TABLE_NAME}(id)
  )
`
