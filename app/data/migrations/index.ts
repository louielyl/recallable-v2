import { createId } from "@paralleldrive/cuid2"
import { SQLiteDatabase } from "expo-sqlite"

// TODO: Divide into multiple migration files.

export async function runMigration(db: SQLiteDatabase) {
	const DATABASE_VERSION = 1

	let { user_version: currentDbVersion } = (await db.getFirstAsync<{ user_version: number }>(
		"PRAGMA user_version",
	)) as { user_version: number }
	if (currentDbVersion >= DATABASE_VERSION) {
		return
	}

	if (currentDbVersion === 0) {
		await db.execAsync("PRAGMA journal_mode = WAL")
		await db.execAsync("PRAGMA foreign_keys = ON")

		// NOTE: Schema migration
		await db.execAsync(`
		CREATE TABLE "head_words" (
			"id" TEXT PRIMARY KEY NOT NULL,
			"content" TEXT NOT NULL,
			"created_at" DATETIME NOT NULL DEFAULT (DATETIME('NOW')),
			"updated_at" DATETIME NOT NULL DEFAULT (DATETIME('NOW')),
			"deleted_at" DATETIME,
			CONSTRAINT "UQ_${createId()}" UNIQUE ("CONTENT")
		)`)

		await db.execAsync(`
		CREATE TABLE "definitions" (
			"id" TEXT PRIMARY KEY NOT NULL,
			"content" TEXT NOT NULL,
			"language" TEXT NOT NULL,
			"created_at" DATETIME NOT NULL DEFAULT (DATETIME('NOW')),
			"updated_at" DATETIME NOT NULL DEFAULT (DATETIME('NOW')),
			"deleted_at" DATETIME,
			CONSTRAINT "UQ_${createId()}" UNIQUE ("CONTENT")
		)`)

		await db.execAsync(`
		CREATE TABLE "head_word_definition_order" (
			"id" TEXT PRIMARY KEY NOT NULL,
			"head_word_id" TEXT NOT NULL,
			"definition_id" TEXT NOT NULL,
			"created_at" DATETIME NOT NULL DEFAULT (DATETIME('NOW')),
			"updated_at" DATETIME NOT NULL DEFAULT (DATETIME('NOW')),
			"deleted_at" DATETIME
		)`)

		await db.execAsync(`
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
			"deleted_at" DATETIME
		)`)

		await db.execAsync(`
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
			"deleted_at" DATETIME
		)`)

		await db.execAsync(`
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
			"deleted_at" DATETIME
		)`)

		// NOTE: Seed
		// const statement = await db.prepareAsync(`INSERT INTO users (id, email) VALUES ($id, $email)`)

		// try {
		// 	let result = await statement.executeAsync({
		// 		$id: "ob3t9qoo7iekwrceysrkerpj",
		// 		$email: `admin@gmail.com`,
		// 	})
		// 	console.log("insert", result.changes)
		// } finally {
		// 	await statement.finalizeAsync()
		// }
	}

	currentDbVersion = 1

	if (currentDbVersion === 1) {
		console.log("hihi")
	}

	await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`)
}
