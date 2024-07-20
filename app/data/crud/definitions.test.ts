import { initDatabase } from "../migrations"
import { DBAPI } from "./base"
import {
  createDefinition,
  deleteDefinition,
  findDefinitions,
  getDefinition,
  updateDefinition,
} from "./definitions"
import { AsyncDatabase } from "promised-sqlite3"

const MOCK_DB_NAME = ":memory:"
const MOCK_DEFINITION_PARAMS_1 = {
  content: "Your language learning companion",
  language: "english",
  is_singular_noun: true,
}
const MOCK_DEFINITION_PARAMS_2 = {
  content: "Your biggest fan",
  language: "english",
  is_singular_noun: true,
}

describe("database", () => {
  it("should create definition", async () => {
    const dbInstance = await AsyncDatabase.open(MOCK_DB_NAME)
    const db = new DBAPI(dbInstance)
    await initDatabase(db)

    // QUESTION: Not sure what the line below is for
    // Access the inner sqlite3.Database object to use the API that is not exposed by AsyncDatabase.
    // db.inner.on("trace", (sql) => console.log("[TRACE]", sql))

    const row = await createDefinition(db, MOCK_DEFINITION_PARAMS_1)
    expect(row.content).toBe(MOCK_DEFINITION_PARAMS_1.content)
    // Close the database.
    await db.close()
  })

  it("should get definition", async () => {
    const dbInstance = await AsyncDatabase.open(MOCK_DB_NAME)
    const db = new DBAPI(dbInstance)
    await initDatabase(db)

    const row = await createDefinition(db, MOCK_DEFINITION_PARAMS_1)
    const rowGot = await getDefinition(db, { id: row.id })
    expect(rowGot.content).toBe(MOCK_DEFINITION_PARAMS_1.content)
    expect(rowGot.language).toBe(MOCK_DEFINITION_PARAMS_1.language)
    expect(rowGot.is_verb).not.toBeTruthy()
    expect(rowGot.is_conjunction).not.toBeTruthy()
    expect(rowGot.is_singular_noun).toBeTruthy()

    await db.close()
  })

  it("should update definition", async () => {
    const dbInstance = await AsyncDatabase.open(MOCK_DB_NAME)
    const db = new DBAPI(dbInstance)
    await initDatabase(db)

    const row = await createDefinition(db, MOCK_DEFINITION_PARAMS_1)
    expect(row.content).toBe(MOCK_DEFINITION_PARAMS_1.content)

    await updateDefinition(db, {
      id: row.id,
      is_singular_noun: false,
      is_conjunction: true,
      is_verb: false,
    })
    const rowUpdated = await getDefinition(db, { id: row.id })
    expect(rowUpdated.content).toBe(MOCK_DEFINITION_PARAMS_1.content)
    expect(rowUpdated.language).toBe(MOCK_DEFINITION_PARAMS_1.language)
    expect(rowUpdated.is_verb).not.toBeTruthy()
    expect(rowUpdated.is_conjunction).toBeTruthy()
    expect(rowUpdated.is_singular_noun).not.toBeTruthy()

    await db.close()
  })

  it("should find definition", async () => {
    const dbInstance = await AsyncDatabase.open(MOCK_DB_NAME)
    const db = new DBAPI(dbInstance)
    await initDatabase(db)

    await createDefinition(db, MOCK_DEFINITION_PARAMS_1)
    await createDefinition(db, MOCK_DEFINITION_PARAMS_2)
    const row = await findDefinitions(db)
    expect(row).toHaveLength(2)

    await db.close()
  })

  it("should delete the definition", async () => {
    const dbInstance = await AsyncDatabase.open(MOCK_DB_NAME)
    const db = new DBAPI(dbInstance)
    await initDatabase(db)

    await createDefinition(db, MOCK_DEFINITION_PARAMS_1)
    await createDefinition(db, MOCK_DEFINITION_PARAMS_2)
    const row = await findDefinitions(db)
    expect(row).toHaveLength(2)

    await deleteDefinition(db, { id: row[0].id })
    const newRow = await findDefinitions(db)
    expect(newRow).toHaveLength(1)

    await db.close()
  })
})
