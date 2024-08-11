import {
  DBHeadWord,
  HeadWordCreate,
  HeadWordDelete,
  HeadWordRead,
  HeadWordUpdate,
  HEAD_WORDS_TABLE_NAME,
  HeadWord,
  HeadWordFindResult,
} from "../entities/headWords"
import { createId } from "@paralleldrive/cuid2"
import { parseParamsToSqlParams } from "app/utils/sqlParameterParser"
import { DBAPI, DBStatement } from "./base"
import { CARDS_TABLE_NAME } from "../entities/cards"

class HeadWordStatement extends DBStatement {
  constructor(tableName: string) {
    super(tableName)
  }
  getSelectAllStatement() {
    return `
      SELECT ${this.tableName}.*, CASE WHEN ${CARDS_TABLE_NAME}.head_word_id IS NULL THEN 0 ELSE 1 END AS is_learning 
      FROM ${this.tableName} 
      LEFT JOIN ${CARDS_TABLE_NAME} ON ${this.tableName}.id = ${CARDS_TABLE_NAME}.head_word_id
    `
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

const headWordStatementGenerator = new HeadWordStatement(HEAD_WORDS_TABLE_NAME)

type DBHeadWordWithLearning = DBHeadWord & { is_learning: number }

// BUG: Tried to use overload and the current way to make the function supports different input/ output type, but failed, need to study how to do it properly in the future.
function dbHeadWordToHeadWord(
  input: DBHeadWord | DBHeadWordWithLearning,
): HeadWordFindResult | HeadWord {
  const result = Object.entries(input).reduce((acc, [key, value]) => {
    if (Boolean(value) && (key === "created_at" || key === "updated_at" || key === "deleted_at")) {
      return { ...acc, [key]: new Date(value as string) }
    } else if (key === "is_learning") {
      return { ...acc, is_learning: Boolean(value) }
    } else {
      return { ...acc, [key]: value }
    }
  }, {} as HeadWord | HeadWordFindResult)
  return "is_learning" in result ? (result as HeadWordFindResult) : (result as HeadWord)
}

export async function findHeadWords(db: DBAPI): Promise<HeadWordFindResult[]> {
  const result = (await db.find(
    headWordStatementGenerator.getSelectAllStatement(),
  )) as DBHeadWordWithLearning[]
  return result.map((item) => {
    const itemWithLearning: DBHeadWordWithLearning = {
      ...item,
      is_learning: "is_learning" in item ? item.is_learning : 0,
    }
    return dbHeadWordToHeadWord(itemWithLearning)
  }) as HeadWordFindResult[]
}

export async function createHeadWord(
  db: DBAPI,
  { id = createId(), ...params }: HeadWordCreate,
): Promise<HeadWord> {
  await db.run(headWordStatementGenerator.getInsertStatement(params), {
    $id: id,
    ...parseParamsToSqlParams(params),
  })

  const result = (await db.get(headWordStatementGenerator.getSelectStatement(), {
    $id: id,
  })) as DBHeadWord

  return dbHeadWordToHeadWord(result)
}

export async function getHeadWord(db: DBAPI, { id, content }: HeadWordRead): Promise<HeadWord> {
  let result
  if (id)
    result = (await db.get(headWordStatementGenerator.getSelectStatement(), {
      $id: id,
    })) as DBHeadWord

  if (content)
    result = (await db.get(headWordStatementGenerator.getSelectByContentStatement(), {
      $content: content,
    })) as DBHeadWord

  if (result) {
    return dbHeadWordToHeadWord(result)
  }
  throw new Error("Head word not found")
}

export async function updateHeadWord(
  db: DBAPI,
  { id, ...params }: HeadWordUpdate,
): Promise<DBHeadWord> {
  const record = (await db.get(headWordStatementGenerator.getSelectStatement(), {
    $id: id,
  })) as DBHeadWord

  await db.run(headWordStatementGenerator.getUpdateStatement(record), {
    $id: id,
    ...parseParamsToSqlParams(record),
    ...parseParamsToSqlParams(params),
  })

  return db.get(headWordStatementGenerator.getSelectStatement(), {
    $id: id,
  }) as Promise<DBHeadWord>
}

export async function deleteHeadWord(db: DBAPI, { id, content }: HeadWordDelete) {
  if (id)
    return db.run(headWordStatementGenerator.getDeleteStatement(), {
      $id: id,
    })

  if (content)
    return db.run(headWordStatementGenerator.getDeleteByContentStatement(), {
      $content: content,
    })
}
