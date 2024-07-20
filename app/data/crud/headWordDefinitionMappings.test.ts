import { DBAPI } from "./base"
import { createDefinition } from "./definitions"
import { createHeadWord } from "./headWords"
import {
  createHeadWordDefinitionMapping,
  findHeadWordDefinitionMappingsByHeadWord,
} from "./headWordDefinitionMappings"
import { AsyncDatabase } from "promised-sqlite3"
import { initDatabase } from "../migrations"

const MOCK_DB_NAME = ":memory:"

const MOCK_HEAD_WORD_PARAMS = {
  content: "recallable",
}
const MOCK_DEFINITION_PARAMS_1 = {
  content: "Your language learning companion",
  language: "english",
  is_singular_noun: true,
}

const MOCK_DEFINITION_PARAMS_2 = {
  content: "Best flash card app you will ever find",
  language: "english",
  is_singular_noun: true,
}

describe("headword definition mappings", () => {
  it("should create headWord definition mapping", async () => {
    const dbInstance = await AsyncDatabase.open(MOCK_DB_NAME)
    const db = new DBAPI(dbInstance)
    await initDatabase(db)

    const headWord = await createHeadWord(db, MOCK_HEAD_WORD_PARAMS)
    const definition1 = await createDefinition(db, MOCK_DEFINITION_PARAMS_1)
    const row = await createHeadWordDefinitionMapping(db, {
      head_word_id: headWord.id,
      definition_id: definition1.id,
    })

    expect(row.head_word_id).toBe(headWord.id)
    expect(row.definition_id).toBe(definition1.id)
    definition1
    await db.close()
  })

  it("should delete headWord definition mapping", async () => {
    const dbInstance = await AsyncDatabase.open(MOCK_DB_NAME)
    const db = new DBAPI(dbInstance)
    await initDatabase(db)

    const headWord = await createHeadWord(db, MOCK_HEAD_WORD_PARAMS)
    const definition1 = await createDefinition(db, MOCK_DEFINITION_PARAMS_1)
    const definition2 = await createDefinition(db, MOCK_DEFINITION_PARAMS_2)
    await createHeadWordDefinitionMapping(db, {
      head_word_id: headWord.id,
      definition_id: definition1.id,
    })
    await createHeadWordDefinitionMapping(db, {
      head_word_id: headWord.id,
      definition_id: definition2.id,
    })

    const rows = await findHeadWordDefinitionMappingsByHeadWord(db, {
      content: MOCK_HEAD_WORD_PARAMS.content,
    })
    expect(rows).toHaveLength(2)

    await db.close()
  })
})
