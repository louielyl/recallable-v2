import { getUpdateTriggerStatement } from "app/utils/sqlUpdateTriggerGenerator"
import { DBAPI } from "../crud/base"
import { DEFINITIONS_TABLE_NAME, DEFINITIONS_DDL } from "../entities/definitions"
import {
  HEAD_WORD_DEFINITION_MAPPING_TABLE_NAME,
  HEAD_WORD_DEFINITION_MAPPINGS_DDL,
} from "../entities/headWordDefinitionMappings"
import { PARAMETERS_DDL, PARAMETERS_TABLE_NAME } from "../entities/parameters"
import { SQLiteDatabase } from "expo-sqlite"
import { createHeadWord } from "../crud/headWords"
import { createDefinition } from "../crud/definitions"
import { HEAD_WORDS_DDL, HEAD_WORDS_TABLE_NAME } from "../entities/headWords"
import { REVIEW_LOGS_DDL, REVIEW_LOGS_TABLE_NAME } from "../entities/reviewLogs"
import { CARDS_DDL, CARDS_TABLE_NAME } from "../entities/cards"
import { createHeadWordDefinitionMapping } from "../crud/headWordDefinitionMappings"

export const initDatabase = async (db: DBAPI) => {
  await db.run(HEAD_WORDS_DDL)
  await db.run(getUpdateTriggerStatement(HEAD_WORDS_TABLE_NAME))

  await db.run(DEFINITIONS_DDL)
  await db.run(getUpdateTriggerStatement(DEFINITIONS_TABLE_NAME))

  await db.run(HEAD_WORD_DEFINITION_MAPPINGS_DDL)
  await db.run(getUpdateTriggerStatement(HEAD_WORD_DEFINITION_MAPPING_TABLE_NAME))

  await db.run(CARDS_DDL)
  await db.run(getUpdateTriggerStatement(CARDS_TABLE_NAME))

  await db.run(REVIEW_LOGS_DDL)
  await db.run(getUpdateTriggerStatement(REVIEW_LOGS_TABLE_NAME))

  await db.run(PARAMETERS_DDL)
  await db.run(getUpdateTriggerStatement(PARAMETERS_TABLE_NAME))
}

// TODO: Divide into multiple migration files.
export async function runMigration(db: SQLiteDatabase) {
  const DATABASE_VERSION = 1
  const WIPE_DB = false
  const ROLLBACK = false

  let { user_version } = (await db.getFirstAsync<{
    user_version: number
  }>("PRAGMA user_version")) as { user_version: number }

  let currentDbVersion = user_version

  if (WIPE_DB) {
    await db.execAsync("PRAGMA user_version = 0")
    await db.execAsync("DROP TABLE head_words")
    await db.execAsync("DROP TABLE definitions")
    await db.execAsync("DROP TABLE head_word_definition_mappings")
    await db.execAsync("DROP TABLE cards")
    await db.execAsync("DROP TABLE review_logs")
    await db.execAsync("DROP TABLE parameters")
    console.log("DB is WIPED")
    return
  }

  // if (currentDbVersion >= DATABASE_VERSION) {
  // 	return
  // }

  if (currentDbVersion <= DATABASE_VERSION && currentDbVersion === 0) {
    await db.execAsync("PRAGMA journal_mode = WAL")
    await db.execAsync("PRAGMA foreign_keys = ON")
    // NOTE: Schema migration
    const dbLayer = new DBAPI(db)
    await initDatabase(dbLayer)

    // NOTE: Seed
    await db.execAsync(`PRAGMA user_version = 1`)
    console.log("Updated DB to version 1")
  }

  if (currentDbVersion <= DATABASE_VERSION && currentDbVersion <= 1) {
    await db.withExclusiveTransactionAsync(async (txn) => {
      const dbLayer = new DBAPI(txn)
      const recallableHeadWordCreateResult = await createHeadWord(dbLayer, {
        content: "recallable",
      })
      const recallableDefinitionCreateResult1 = await createDefinition(dbLayer, {
        content: "Your language learning companion",
        language: "english",
      })
      const recallableDefinitionCreateResult2 = await createDefinition(dbLayer, {
        content: "Language learner for everyone",
        language: "english",
      })
      await createHeadWordDefinitionMapping(dbLayer, {
        head_word_id: recallableHeadWordCreateResult.id,
        definition_id: recallableDefinitionCreateResult1.id,
      })
      await createHeadWordDefinitionMapping(dbLayer, {
        head_word_id: recallableHeadWordCreateResult.id,
        definition_id: recallableDefinitionCreateResult2.id,
      })
      if (ROLLBACK) throw new Error("Roll back")
    })
  }

  await db.execAsync(`PRAGMA user_version = 2`)
}
