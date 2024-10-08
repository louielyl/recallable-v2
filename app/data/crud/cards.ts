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
  ScheduledCard,
} from "../entities/cards"
import { FSRS, RecordLogItem, createEmptyCard } from "ts-fsrs"
import { getHeadWord } from "./headWords"
import { getParameters } from "./parameters"
import { createReviewLog } from "./reviewLogs"
import { HeadWord } from "../entities/headWords"
import { Definition } from "../entities/definitions"
import { definitionStatementGeneartor } from "./definitions"

class CardStatement extends DBStatement {
  constructor(tableName: string) {
    super(tableName)
  }
  findTodaysCards() {
    return `
      SELECT * from ${this.tableName}
      WHERE date('now') >= date(due)
      ORDER BY due ASC;
    `
  }
  getSelectByHeadWordId() {
    return `
      SELECT * FROM ${this.tableName} 
      WHERE head_word_id = $head_word_id 
      ORDER BY created_at DESC 
      LIMIT 1;
    `
  }
}

const cardStatementGenerator = new CardStatement(CARDS_TABLE_NAME)

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

function scheduledCardToFSRSCard(input: ScheduledCard): Card {
  return Object.entries(input).reduce((acc, [key, value]) => {
    if (key === "headWord" || key === "definitions") {
      return acc
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

  await db.run(cardStatementGenerator.getInsertStatement({ ...emptyCard, ...params }), {
    $id: id,
    ...parseParamsToSqlParams(emptyCard),
    ...parseParamsToSqlParams(params),
  })

  const dbCard = (await db.get(cardStatementGenerator.getSelectStatement(), {
    $id: id,
  })) as DBCard
  return dbCardToCard(dbCard)
}

export async function findScheduledCards(db: DBAPI, { }): Promise<ScheduledCard[]> {
  try {
    const cards: Card[] = await db.find(cardStatementGenerator.findTodaysCards())
    return Promise.all(
      cards.map(async (card) => {
        const definitions: Definition[] = await db.find(
          definitionStatementGeneartor.findDefinitionsByHeadWordId(card.head_word_id),
        )
        const headWord: HeadWord = await getHeadWord(db, { id: card.head_word_id })
        return { ...card, definitions, headWord }
      }),
    )
  } catch (e) {
    console.log(e)
    throw e
  }
}

export async function getCardByHeadWord(db: DBAPI, { content }: CardRead): Promise<Card | null> {
  try {
    const head_word_id = (await getHeadWord(db, { content })).id

    const dbCard = await db.get(cardStatementGenerator.getSelectByHeadWordId(), {
      $head_word_id: head_word_id,
    })

    if (!dbCard) throw new Error("No card is found")

    return dbCardToCard(dbCard)
  } catch (e) {
    return null
  }
}

export async function scheduleCard(db: DBAPI, { card, rating }: CardSchedule): Promise<Card> {
  const parameters = await getParameters(db, {})
  const f: FSRS = new FSRS(parameters)

  const schedulingCard = f.repeat(card, new Date())[rating] as RecordLogItem

  await createReviewLog(db, { ...schedulingCard.log, head_word_id: card.head_word_id })

  await db.run(cardStatementGenerator.getUpdateStatement({ ...schedulingCard.card }), {
    $id: card.id,
    ...parseParamsToSqlParams(schedulingCard.card),
  })

  const dbCard = await db.get(cardStatementGenerator.getSelectStatement(), {
    $id: card.id,
  })
  return dbCardToCard(dbCard)
}

export async function updateCard(db: DBAPI, { id, ...params }: CardUpdate): Promise<DBCard> {
  const record = (await db.get(cardStatementGenerator.getSelectStatement(), {
    $id: id,
  })) as DBCard

  await db.run(cardStatementGenerator.getUpdateStatement(record), {
    $id: id,
    ...parseParamsToSqlParams(record),
    ...parseParamsToSqlParams(params),
  })

  return db.get(cardStatementGenerator.getSelectStatement(), {
    $id: id,
  }) as Promise<DBCard>
}

export async function deleteCard(db: DBAPI, { id, head_word_id }: CardDelete) {
  try {
    if (id) {
      return db.run(cardStatementGenerator.getDeleteStatement(), { $id: id })
    }
    if (head_word_id) {
      const card = await db.get(cardStatementGenerator.getSelectByHeadWordId(), {
        $head_word_id: head_word_id,
      })
      return db.run(cardStatementGenerator.getDeleteStatement(), { $id: card.id })
    }
  } catch (e) {
    console.error(e)
    throw e
  }
}
