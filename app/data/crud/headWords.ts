import {
  DBHeadWord,
  HeadWordCreate,
  HeadWordDelete,
  HeadWordRead,
  HeadWordUpdate,
  HEAD_WORDS_TABLE_NAME,
} from "../entities/headWords"
import { createId } from "@paralleldrive/cuid2"
import { parseParamsToSqlParams } from "app/utils/sqlParameterParser"
import { DBAPI, DBStatement } from "./base"

class HeadWordStatement extends DBStatement {
  constructor(tableName: string) {
    super(tableName)
  }

  getSelectByContentStatement() {
    return `
      SELECT * FROM ${this.tableName} WHERE content = $content
    `
  }

  getDeleteByContentStatement() {
    return `
      DELETE FROM ${this.tableName} 
      WHERE content = $content
    `
  }
}

const headWord = new HeadWordStatement(HEAD_WORDS_TABLE_NAME)

export async function createHeadWord(
  db: DBAPI,
  { id = createId(), ...params }: HeadWordCreate,
): Promise<DBHeadWord> {
  await db.run(headWord.getInsertStatement(params), {
    $id: id,
    ...parseParamsToSqlParams(params),
  })

  return db.get(headWord.getSelectStatement(), {
    $id: id,
  }) as Promise<DBHeadWord>
}

export async function findHeadWords(db: DBAPI): Promise<DBHeadWord[]> {
  return db.find(headWord.getSelectAllStatement())
}

export async function getHeadWord(db: DBAPI, { id, content }: HeadWordRead): Promise<DBHeadWord> {
  if (id)
    return db.get(headWord.getSelectStatement(), {
      $id: id,
    }) as Promise<DBHeadWord>

  if (content)
    return db.get(headWord.getSelectByContentStatement(), {
      $content: content,
    }) as Promise<DBHeadWord>

  throw new Error("Head word not found")
}

export async function updateHeadWord(
  db: DBAPI,
  { id, ...params }: HeadWordUpdate,
): Promise<DBHeadWord> {
  const record = (await db.get(headWord.getSelectStatement(), {
    $id: id,
  })) as DBHeadWord

  await db.run(headWord.getUpdateStatement(record), {
    $id: id,
    ...parseParamsToSqlParams(record),
    ...parseParamsToSqlParams(params),
  })

  return db.get(headWord.getSelectStatement(), {
    $id: id,
  }) as Promise<DBHeadWord>
}

export async function deleteHeadWord(db: DBAPI, { id, content }: HeadWordDelete) {
  if (id)
    return db.run(headWord.getDeleteStatement(), {
      $id: id,
    })

  if (content)
    return db.run(headWord.getDeleteByContentStatement(), {
      $content: content,
    })
}
