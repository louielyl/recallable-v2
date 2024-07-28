import { Grade } from "ts-fsrs"
import { DBTimestampBase, TimestampBase } from "./base"
import { HEAD_WORDS_TABLE_NAME, HeadWord } from "./headWords"

export enum State {
  New = 0,
  Learning = 1,
  Review = 2,
  Relearning = 3,
}

export type DBCard = DBTimestampBase & {
  head_word_id: string
  due: string
  stability: number
  difficulty: number
  elapsed_days: number
  scheduled_days: number
  reps: number
  lapses: number
  state: number
  last_review?: string
}

export type Card = TimestampBase & {
  head_word_id: string
  due: Date // Date when the card is next due for review
  stability: number // A measure of how well the information is retained
  difficulty: number // Reflects the inherent difficulty of the card content
  elapsed_days: number // Days since the card was last reviewed
  scheduled_days: number // The interval at which the card is next scheduled
  reps: number // Total number of times the card has been reviewed
  lapses: number // Times the card was forgotten or remembered incorrectly
  state: State // The current state of the card (New, Learning, Review, Relearning)
  last_review?: Date // The most recent review date, if applicable
}

export type CardCreate = Partial<Card> & Pick<Card, "head_word_id">
export type CardSchedule = { currentCard: Card; rating: Grade }
export type CardRead = Pick<HeadWord, "content">
export type CardUpdate = Partial<Card> & Pick<Card, "id">
export type CardDelete = Pick<Card, "id">

export const CARDS_TABLE_NAME = "cards"

export const CARDS_DDL = `
  CREATE TABLE "${CARDS_TABLE_NAME}" (
    "id" TEXT PRIMARY KEY NOT NULL,
    "head_word_id" TEXT NOT NULL,
    "due" DATETIME NOT NULL,
    "stability" REAL NOT NULL,
    "difficulty" REAL NOT NULL,
    "elapsed_days" INTEGER NOT NULL,
    "scheduled_days" INTEGER NOT NULL,
    "reps" INTEGER NOT NULL,
    "lapses" INTEGER NOT NULL,
    "state" INTEGER NOT NULL,
    "last_review" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT (DATETIME('NOW')),
    "updated_at" DATETIME NOT NULL DEFAULT (DATETIME('NOW')),
    "deleted_at" DATETIME,
    FOREIGN KEY(head_word_id) REFERENCES ${HEAD_WORDS_TABLE_NAME}(id)
)`
