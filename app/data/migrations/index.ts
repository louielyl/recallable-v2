import { createId } from "@paralleldrive/cuid2"
import { SQLiteDatabase } from "expo-sqlite"
import { createHeadWord, deleteHeadWord, updateHeadWord } from "crud/headWord"
import { createDefinition } from "crud/definition"
import { HeadWord } from "../entities/headWord"
import { getUpdateTriggerStatement } from "app/utils/sqlUpdateTriggerGenerator"

// TODO: Divide into multiple migration files.
export async function runMigration(db: SQLiteDatabase) {
  const DATABASE_VERSION = 1
  const wipe_db = false

  let { user_version: currentDbVersion } = (await db.getFirstAsync<{
    user_version: number
  }>("PRAGMA user_version")) as { user_version: number }

  if (wipe_db) {
    await db.execAsync("DROP TABLE head_words")
    await db.execAsync("DROP TABLE definitions")
    await db.execAsync("DROP TABLE head_word_definition_mapping")
    await db.execAsync("DROP TABLE cards")
    await db.execAsync("DROP TABLE review_logs")
    await db.execAsync("DROP TABLE parameters")
    await db.execAsync(`PRAGMA user_version = 0`)
    console.log("WIPED")
    return
  }

  // if (currentDbVersion >= DATABASE_VERSION) {
  // 	return
  // }

  if (currentDbVersion <= DATABASE_VERSION && currentDbVersion === 0) {
    await db.execAsync("PRAGMA journal_mode = WAL")
    await db.execAsync("PRAGMA foreign_keys = ON")
    // NOTE: Schema migration
    await db.withExclusiveTransactionAsync(async (txn) => {
      await txn.execAsync(`
	CREATE TABLE "head_words" (
	  "id" TEXT PRIMARY KEY NOT NULL,
	  "content" TEXT NOT NULL,
	  "created_at" DATETIME NOT NULL DEFAULT (DATETIME('NOW')),
	  "updated_at" DATETIME NOT NULL DEFAULT (DATETIME('NOW')),
	  "deleted_at" DATETIME,
	  CONSTRAINT "UQ_${createId()}" UNIQUE ("content")
      )`)
      await txn.execAsync(getUpdateTriggerStatement("head_words"))

      await txn.execAsync(`
	CREATE TABLE "definitions" (
	  "id" TEXT PRIMARY KEY NOT NULL,
	  "content" TEXT NOT NULL,
	  "language" TEXT NOT NULL,
	  "is_verb" BOOLEAN DEFAULT FALSE,
	  "is_adjective" BOOLEAN DEFAULT FALSE,
	  "is_comparative_adjective" BOOLEAN DEFAULT FALSE,
	  "is_superlative_adjective" BOOLEAN DEFAULT FALSE,
	  "is_countable_noun" BOOLEAN DEFAULT FALSE,
	  "is_uncountable_noun" BOOLEAN DEFAULT FALSE,
	  "is_singular_noun" BOOLEAN DEFAULT FALSE,
	  "is_plural_noun" BOOLEAN DEFAULT FALSE,
	  "is_transitive_verb" BOOLEAN DEFAULT FALSE,
	  "is_intransitive_verb" BOOLEAN DEFAULT FALSE,
	  "is_adverb" BOOLEAN DEFAULT FALSE,
	  "is_conjunction" BOOLEAN DEFAULT FALSE,
	  "is_determiner" BOOLEAN DEFAULT FALSE,
	  "is_preposition" BOOLEAN DEFAULT FALSE,
	  "is_predeterminer" BOOLEAN DEFAULT FALSE,
	  "is_pronoun" BOOLEAN DEFAULT FALSE,
	  "is_prefix" BOOLEAN DEFAULT FALSE,
	  "is_sufffix" BOOLEAN DEFAULT FALSE,
	  "is_exclamation" BOOLEAN DEFAULT FALSE,
	  "is_interjection" BOOLEAN DEFAULT FALSE,
	  "created_at" DATETIME NOT NULL DEFAULT (DATETIME('NOW')),
	  "updated_at" DATETIME NOT NULL DEFAULT (DATETIME('NOW')),
	  "deleted_at" DATETIME,
	  CONSTRAINT "UQ_${createId()}" UNIQUE ("content")
      )`)
      await txn.execAsync(getUpdateTriggerStatement("definitions"))

      await txn.execAsync(`
	CREATE TABLE "head_word_definition_mapping" (
	  "id" TEXT PRIMARY KEY NOT NULL,
	  "head_word_id" TEXT NOT NULL,
	  "definition_id" TEXT NOT NULL,
	  "created_at" DATETIME NOT NULL DEFAULT (DATETIME('NOW')),
	  "updated_at" DATETIME NOT NULL DEFAULT (DATETIME('NOW')),
	  "deleted_at" DATETIME,
	  FOREIGN KEY(head_word_id) REFERENCES head_words(id),
	  FOREIGN KEY(definition_id) REFERENCES definitions(id)
      )`)
      await txn.execAsync(getUpdateTriggerStatement("head_word_definition_mapping"))

      await txn.execAsync(`
	CREATE TABLE "cards" (
	  "id" TEXT PRIMARY KEY NOT NULL,
	  "head_word_id" TEXT NOT NULL,
	  "due_at" DATETIME NOT NULL,
	  "stability" REAL NOT NULL,
	  "difficulty" REAL NOT NULL,
	  "elapsed_days" INTEGER NOT NULL,
	  "scheduled_days" INTEGER NOT NULL,
	  "reps" INTEGER NOT NULL,
	  "lapses" INTEGER NOT NULL,
	  "state" INTEGER NOT NULL,
	  "is_suspended" INTEGER NOT NULL,
	  "reviewed_at" DATETIME NOT NULL,
	  "created_at" DATETIME NOT NULL DEFAULT (DATETIME('NOW')),
	  "updated_at" DATETIME NOT NULL DEFAULT (DATETIME('NOW')),
	  "deleted_at" DATETIME,
	  FOREIGN KEY(head_word_id) REFERENCES head_words(id)
      )`)
      await txn.execAsync(getUpdateTriggerStatement("cards"))

      await txn.execAsync(`
	CREATE TABLE "review_logs" (
	  "id" TEXT PRIMARY KEY NOT NULL,
	  "head_word_id" TEXT NOT NULL,
	  "grade" INTEGER NOT NULL,
	  "state" INTEGER NOT NULL,
	  "due_at" DATETIME NOT NULL,
	  "stability" REAL NOT NULL,
	  "difficulty" REAL NOT NULL,
	  "elapsed_days" INTEGER NOT NULL,
	  "last_elapsed_days" INTEGER NOT NULL,
	  "scheduled_days" INTEGER NOT NULL,
	  "reviewed_at" DATETIME NOT NULL,
	  "duration" INTEGER NOT NULL,
	  "created_at" DATETIME NOT NULL DEFAULT (DATETIME('NOW')),
	  "updated_at" DATETIME NOT NULL DEFAULT (DATETIME('NOW')),
	  "deleted_at" DATETIME,
	  FOREIGN KEY(head_word_id) REFERENCES head_words(id)
      )`)
      await txn.execAsync(getUpdateTriggerStatement("review_logs"))

      await txn.execAsync(`
	CREATE TABLE "parameters" (
	  "id" TEXT PRIMARY KEY NOT NULL,
	  "head_word_id" TEXT NOT NULL,
	  "request_retention" REAL DEFAULT 0.9 NOT NULL,
	  "maximum_interval" INTEGER DEFAULT 36500 NOT NULL,
	  "w" BLOB NOT NULL,
	  "enable_fuzz" INTEGER DEFAULT 0 NOT NULL,
	  "card_limit" INTEGER DEFAULT 50 NOT NULL,
	  "lapses" INTEGER NOT NULL,
	  "lingq_token" TEXT,
	  "lingq_counter" TEXT,
	  "created_at" DATETIME NOT NULL DEFAULT (DATETIME('NOW')),
	  "updated_at" DATETIME NOT NULL DEFAULT (DATETIME('NOW')),
	  "deleted_at" DATETIME,
	  FOREIGN KEY(head_word_id) REFERENCES head_words(id)
      )`)
      await txn.execAsync(getUpdateTriggerStatement("parameters"))
    })

    // NOTE: Seed
    await db.execAsync(`PRAGMA user_version = 1`)
    console.log("Updated DB to version 1")
  }

  if (currentDbVersion <= DATABASE_VERSION && currentDbVersion <= 1) {
    await db.withExclusiveTransactionAsync(async (txn) => {
      try {
        // let recallableCreateResult = await createHeadWord(txn, { content: "recallable" })
        // let codeclubCreateResult = await createHeadWord(txn, { content: "codeclub" })
        // let findAllResult = (await txn.getAllAsync("SELECT * FROM head_words")) as HeadWord[]
        // console.log("findAllResult", findAllResult)
        // await
      } catch (error) {
        console.log(error)
      }
    })
  }
  // await db.execAsync(`PRAGMA user_version = 2`)
}
