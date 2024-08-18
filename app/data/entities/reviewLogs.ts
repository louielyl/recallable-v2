import { Rating, State } from "ts-fsrs"
import { DBTimestampBase, TimestampBase } from "./base"
import { HEAD_WORDS_TABLE_NAME } from "./headWords"

export const REVIEW_LOGS_TABLE_NAME = "review_logs"

export type DBReviewLog = DBTimestampBase & {
  head_word_id: string
  rating: number // Rating of the review (Again, Hard, Good, Easy)
  state: number // State of the review (New, Learning, Review, Relearning)
  due: string // Date of the last scheduling
  stability: number // Stability of the card before the review
  difficulty: number // Difficulty of the card before the review
  elapsed_days: number // Number of days elapsed since the last review
  last_elapsed_days: number // Number of days between the last two reviews
  scheduled_days: number // Number of days until the next review
  review: string | null // Date of the review
}

export type ReviewLog = TimestampBase & {
  head_word_id: string
  rating: Rating // Rating of the review (Again, Hard, Good, Easy)
  state: State // State of the review (New, Learning, Review, Relearning)
  due: Date // Date of the last scheduling
  stability: number // Stability of the card before the review
  difficulty: number // Difficulty of the card before the review
  elapsed_days: number // Number of days elapsed since the last review
  last_elapsed_days: number // Number of days between the last two reviews
  scheduled_days: number // Number of days until the next review
  review: Date // Date of the review
}

export type ReviewLogCreate = Partial<ReviewLog> & Pick<ReviewLog, "head_word_id">
export type ReviewLogRead = Pick<ReviewLog, "head_word_id">
export type ReviewLogUpdate = Pick<ReviewLog, "id">
export type ReviewLogDelete = Pick<ReviewLog, "id">

export const REVIEW_LOGS_DDL = `
  CREATE TABLE "${REVIEW_LOGS_TABLE_NAME}" (
    "id" TEXT PRIMARY KEY NOT NULL,
    "head_word_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "state" INTEGER NOT NULL,
    "due" DATETIME NOT NULL,
    "stability" REAL NOT NULL,
    "difficulty" REAL NOT NULL,
    "elapsed_days" INTEGER NOT NULL,
    "last_elapsed_days" INTEGER NOT NULL,
    "scheduled_days" INTEGER NOT NULL,
    "review" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT (STRFTIME('%FT%R:%fZ','NOW')),
    "updated_at" DATETIME NOT NULL DEFAULT (STRFTIME('%FT%R:%fZ','NOW')),
    "deleted_at" DATETIME,
    FOREIGN KEY(head_word_id) REFERENCES ${HEAD_WORDS_TABLE_NAME}(id)
  );
`
