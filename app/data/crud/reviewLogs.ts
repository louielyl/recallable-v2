import { createId } from "@paralleldrive/cuid2"
import {
  DBReviewLog,
  REVIEW_LOGS_TABLE_NAME,
  ReviewLogCreate,
  ReviewLogDelete,
  ReviewLogRead,
  ReviewLogUpdate,
} from "../entities/reviewLogs"
import { DBAPI, DBStatement } from "./base"
import { parseParamsToSqlParams } from "app/utils/sqlParameterParser"

class ReviewLogStatement extends DBStatement {
  constructor(tableName: string) {
    super(tableName)
  }

  getSelectByHeadWordIdStatement() {
    return `
      SELECT * FROM ${this.tableName} WHERE head_word_id = $head_word_id;
    `
  }
}

const revlewLog = new ReviewLogStatement(REVIEW_LOGS_TABLE_NAME)

export async function createReviewLog(
  db: DBAPI,
  { id = createId(), ...params }: ReviewLogCreate,
): Promise<DBReviewLog> {
  await db.run(revlewLog.getInsertStatement(params), {
    $id: id,
    ...parseParamsToSqlParams(params),
  })

  return db.get(revlewLog.getSelectStatement(), {
    $id: id,
  }) as Promise<DBReviewLog>
}

export async function findReviewLogs(db: DBAPI): Promise<DBReviewLog[]> {
  return db.find(revlewLog.getSelectAllStatement())
}

export async function getReviewLog(
  db: DBAPI,
  { head_word_id }: ReviewLogRead,
): Promise<DBReviewLog> {
  if (head_word_id)
    return db.get(revlewLog.getSelectByHeadWordIdStatement(), {
      $head_word_id: head_word_id,
    }) as Promise<DBReviewLog>

  throw new Error("Head word not found")
}

export async function updateReviewLog(
  db: DBAPI,
  { id, ...params }: ReviewLogUpdate,
): Promise<DBReviewLog> {
  const record = (await db.get(revlewLog.getSelectStatement(), {
    $id: id,
  })) as DBReviewLog

  await db.run(revlewLog.getUpdateStatement(record), {
    $id: id,
    ...parseParamsToSqlParams(record),
    ...parseParamsToSqlParams(params),
  })

  return db.get(revlewLog.getSelectStatement(), {
    $id: id,
  }) as Promise<DBReviewLog>
}

export async function deleteReviewLog(db: DBAPI, { id }: ReviewLogDelete) {
  if (id)
    return db.run(revlewLog.getDeleteStatement(), {
      $id: id,
    })
}
