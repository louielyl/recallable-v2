import { initDatabase } from "../migrations"
import { DBAPI } from "./base"
import {
  createHeadWord,
  deleteHeadWord,
  findHeadWords,
  getHeadWord,
  updateHeadWord,
} from "./headWords"
import { AsyncDatabase } from "promised-sqlite3"

const MOCK_DB_NAME = ":memory:"

describe("database", () => {
  it("should create headword", async () => {
    const dbInstance = await AsyncDatabase.open(MOCK_DB_NAME)
    const db = new DBAPI(dbInstance)
    await initDatabase(db)

    // QUESTION: Not sure what the line below is for
    // Access the inner sqlite3.Database object to use the API that is not exposed by AsyncDatabase.
    // db.inner.on("trace", (sql) => console.log("[TRACE]", sql))

    const row = await createHeadWord(db, { content: "recallable" })
    expect(row.content).toBe("recallable")
    // Close the database.
    await db.close()
  })

  it("should get headword", async () => {
    const dbInstance = await AsyncDatabase.open(MOCK_DB_NAME)
    const db = new DBAPI(dbInstance)
    await initDatabase(db)

    await createHeadWord(db, { content: "recallable" })
    const row = await getHeadWord(db, { content: "recallable" })
    expect(row.content).toBe("recallable")

    await db.close()
  })

  it("should update headword", async () => {
    const dbInstance = await AsyncDatabase.open(MOCK_DB_NAME)
    const db = new DBAPI(dbInstance)
    await initDatabase(db)

    await createHeadWord(db, { content: "recallable" })
    await createHeadWord(db, { content: "codeclub" })

    const row = await getHeadWord(db, { content: "recallable" })
    expect(row.content).toBe("recallable")

    await updateHeadWord(db, { id: row.id, content: "recallable-2" })
    const updatedRow = await getHeadWord(db, { id: row.id })
    expect(updatedRow.content).toBe("recallable-2")

    await db.close()
  })

  it("should find headword", async () => {
    const dbInstance = await AsyncDatabase.open(MOCK_DB_NAME)
    const db = new DBAPI(dbInstance)
    await initDatabase(db)

    await createHeadWord(db, { content: "recallable" })
    await createHeadWord(db, { content: "codeclub" })
    const row = await findHeadWords(db)
    expect(row).toHaveLength(2)

    await db.close()
  })

  it("should delete the headword", async () => {
    const dbInstance = await AsyncDatabase.open(MOCK_DB_NAME)
    const db = new DBAPI(dbInstance)
    await initDatabase(db)

    await createHeadWord(db, { content: "recallable" })
    await createHeadWord(db, { content: "codeclub" })
    const row = await findHeadWords(db)
    expect(row).toHaveLength(2)

    await deleteHeadWord(db, { content: "codeclub" })
    const newRow = await findHeadWords(db)
    expect(newRow).toHaveLength(1)

    await db.close()
  })
})
