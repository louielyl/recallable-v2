import { createId } from "@paralleldrive/cuid2"
import { DBTimestampBase, TimestampBase } from "./base"

export type DBHeadWord = DBTimestampBase & {
  content: string | null
  source: string | null
}

export type HeadWord = TimestampBase & {
  content: string | null
  source: string | null
}

export type HeadWordFindResult = HeadWord & { is_learning: boolean }

export type HeadWordCreate = Partial<HeadWord> & Pick<HeadWord, "content">
export type HeadWordRead = Partial<Pick<HeadWord, "id" | "content">>
export type HeadWordUpdate = Partial<HeadWord> & Pick<HeadWord, "id">
export type HeadWordDelete = Partial<Pick<HeadWord, "id" | "content">>

export const HEAD_WORDS_TABLE_NAME = "head_words"

export const HEAD_WORDS_DDL = `
  CREATE TABLE "${HEAD_WORDS_TABLE_NAME}" (
    "id" TEXT PRIMARY KEY NOT NULL,
    "content" TEXT NOT NULL,
    "source" TEXT DEFAULT 'recallable',
    "created_at" DATETIME NOT NULL DEFAULT (STRFTIME('%FT%R:%fZ','NOW')),
    "updated_at" DATETIME NOT NULL DEFAULT (STRFTIME('%FT%R:%fZ','NOW')),
    "deleted_at" DATETIME,
    CONSTRAINT "UQ_${createId()}" UNIQUE ("content")
  );
`
