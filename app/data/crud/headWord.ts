import { SQLiteDatabase } from "expo-sqlite"
import {
  DBHeadWord,
  HeadWordCreate,
  HeadWordDelete,
  HeadWordRead,
  HeadWordUpdate,
} from "../entities/headWord"
import { createId } from "@paralleldrive/cuid2"

export async function createHeadWord(
  db: SQLiteDatabase,
  { id = createId(), content }: HeadWordCreate,
): Promise<DBHeadWord> {
  let result = await db.runAsync(
    `
			INSERT INTO head_words (id, content) 
			VALUES ($id, $content)
		`,
    {
      $id: id,
      $content: content,
    },
  )

  // BUG: Sometimes it will return lastInsertRowId even if it didn't create any new row, keep observe.
  return db.getFirstAsync(`SELECT * from head_words WHERE rowid = $rowid`, {
    $rowid: result.lastInsertRowId,
  }) as Promise<DBHeadWord>
}

export async function findHeadWord(db: SQLiteDatabase): Promise<DBHeadWord[]> {
  return db.getAllAsync(
    `
			SELECT * from head_words
		`,
  )
}

export async function getHeadWord(db: SQLiteDatabase, { id }: HeadWordRead): Promise<DBHeadWord> {
  return db.getFirstAsync(`SELECT * from head_words WHERE id = $id`, {
    $id: id,
  }) as Promise<DBHeadWord>
}

export async function updateHeadWord(
  db: SQLiteDatabase,
  body: HeadWordUpdate,
): Promise<DBHeadWord> {
  const { id, content, created_at, updated_at, deleted_at } = body
  const record = (await db.getFirstAsync(`SELECT * FROM head_words WHERE id = $id`, {
    $id: id,
  })) as DBHeadWord
  await db.runAsync(
    `
			UPDATE head_words SET 
			(content, created_at, updated_at, deleted_at) = 
			($content, $created_at, $updated_at, $deleted_at)
			WHERE id = $id
		`,
    {
      $id: id,
      $content: content ?? record.content,
      $created_at: created_at?.toISOString() ?? record.created_at,
      $updated_at: updated_at?.toISOString() ?? new Date().toISOString(),
      $deleted_at: deleted_at?.toISOString() ?? record.deleted_at,
    },
  )

  return db.getFirstAsync(`SELECT * from head_words WHERE id = $id`, {
    $id: id,
  }) as Promise<DBHeadWord>
}

export async function deleteHeadWord(db: SQLiteDatabase, body: HeadWordDelete) {
  const { content } = body
  return db.runAsync(
    `
			DELETE FROM head_words 
			WHERE content = $content
		`,
    {
      $content: content,
    },
  )
}
