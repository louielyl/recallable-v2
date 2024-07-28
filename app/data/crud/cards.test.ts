import { AsyncDatabase } from "promised-sqlite3"
import { initDatabase } from "../migrations"
import { DBAPI } from "./base"
import { createHeadWord } from "./headWords"
import { createCard, getCardByHeadWord, scheduleCard } from "./cards"
import { Rating } from "ts-fsrs"
import { getReviewLog } from "./reviewLogs"
import { isAfter } from "date-fns"

const MOCK_DB_NAME = "test.sqlite"

const MOCK_HEAD_WORD_PARAMS = {
  content: "recallable",
}

describe("cards", () => {
  it("should create card", async () => {
    const dbInstance = await AsyncDatabase.open(MOCK_DB_NAME)
    const db = new DBAPI(dbInstance)
    await initDatabase(db)

    const headWord = await createHeadWord(db, MOCK_HEAD_WORD_PARAMS)
    const card = await createCard(db, { head_word_id: headWord.id })

    expect(card).toBeTruthy()
  })

  it("should get card", async () => {
    const dbInstance = await AsyncDatabase.open(MOCK_DB_NAME)
    const db = new DBAPI(dbInstance)
    await initDatabase(db)

    const headWord = await createHeadWord(db, MOCK_HEAD_WORD_PARAMS)
    const createdCard = await createCard(db, { head_word_id: headWord.id })
    const card = await getCardByHeadWord(db, MOCK_HEAD_WORD_PARAMS)

    expect(card).toMatchObject(createdCard)
  })

  it("should schedule new card", async () => {
    const dbInstance = await AsyncDatabase.open(MOCK_DB_NAME)
    const db = new DBAPI(dbInstance)
    await initDatabase(db)

    const headWord = await createHeadWord(db, MOCK_HEAD_WORD_PARAMS)
    const currentCard = await createCard(db, { head_word_id: headWord.id })
    const newCard = await scheduleCard(db, { currentCard, rating: Rating.Hard })
    const reviewLog = await getReviewLog(db, { head_word_id: headWord.id })

    expect(isAfter(newCard.due, currentCard.due)).toBeTruthy()
  })
})
