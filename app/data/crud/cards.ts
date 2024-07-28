import { createId } from "@paralleldrive/cuid2"
import { parseParamsToSqlParams } from "app/utils/sqlParameterParser"
import { DBAPI, DBStatement } from "./base"
import {
  CARDS_TABLE_NAME,
  Card,
  CardCreate,
  CardDelete,
  CardRead,
  CardSchedule,
  CardUpdate,
  DBCard,
} from "../entities/cards"
import { FSRS, RecordLogItem, createEmptyCard, RecordLog, Grade } from "ts-fsrs"
import { getHeadWord } from "./headWords"
import { getParameters } from "./parameters"
import { createReviewLog } from "./reviewLogs"

class CardStatement extends DBStatement {
  constructor(tableName: string) {
    super(tableName)
  }
  getSelectByHeadWordId() {
    return `
      SELECT * FROM ${this.tableName} 
      WHERE head_word_id = $head_word_id 
      ORDER BY created_at DESC 
      LIMIT 1
    `
  }
}

const card = new CardStatement(CARDS_TABLE_NAME)

function dbCardToCard(input: DBCard): Card {
  return Object.entries(input).reduce((acc, [key, value]) => {
    if (
      Boolean(value) &&
      (key === "due" ||
        key === "last_review" ||
        key === "created_at" ||
        key === "updated_at" ||
        key === "deleted_at")
    ) {
      return { ...acc, [key]: new Date(value as string) }
    } else {
      return { ...acc, [key]: value }
    }
  }, {} as Card)
}

export async function createCard(
  db: DBAPI,
  { id = createId(), ...params }: CardCreate,
): Promise<Card> {
  const emptyCard = createEmptyCard()

  await db.run(card.getInsertStatement({ ...emptyCard, ...params }), {
    $id: id,
    ...parseParamsToSqlParams(emptyCard),
    ...parseParamsToSqlParams(params),
  })

  const dbCard = (await db.get(card.getSelectStatement(), {
    $id: id,
  })) as DBCard
  return dbCardToCard(dbCard)
}

export async function getCardByHeadWord(db: DBAPI, { content }: CardRead): Promise<Card> {
  const head_word_id = (await getHeadWord(db, { content })).id

  const dbCard = await db.get(card.getSelectByHeadWordId(), {
    $head_word_id: head_word_id,
  })
  return dbCardToCard(dbCard)
}

export async function scheduleCard(
  db: DBAPI,
  { currentCard, rating }: CardSchedule,
): Promise<Card> {
  const parameters = await getParameters(db, {})
  const f: FSRS = new FSRS(parameters)

  const schedulingCard = f.repeat(currentCard, new Date())[rating] as RecordLogItem
  await createReviewLog(db, { ...schedulingCard.log, head_word_id: currentCard.head_word_id })

  await db.run(card.getUpdateStatement({ ...schedulingCard.card }), {
    $id: currentCard.id,
    ...parseParamsToSqlParams(schedulingCard.card),
  })

  const dbCard = await db.get(card.getSelectStatement(), {
    $id: currentCard.id,
  })
  return dbCardToCard(dbCard)
}

export async function updateCard(db: DBAPI, { id, ...params }: CardUpdate): Promise<DBCard> {
  const record = (await db.get(card.getSelectStatement(), {
    $id: id,
  })) as DBCard

  await db.run(card.getUpdateStatement(record), {
    $id: id,
    ...parseParamsToSqlParams(record),
    ...parseParamsToSqlParams(params),
  })

  return db.get(card.getSelectStatement(), {
    $id: id,
  }) as Promise<DBCard>
}

export async function deleteCard(db: DBAPI, { id }: CardDelete) {
  return db.run(card.getDeleteStatement(), { $id: id })
}
