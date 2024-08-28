import { createId } from "@paralleldrive/cuid2"
import { DBTimestampBase, TimestampBase } from "./base"
import { HeadWord } from "./headWords"

export type DBDefinition = DBTimestampBase & {
  content: string
  language: string
  source: string | null
  is_verb: number
  is_transitive_verb: number
  is_intransitive_verb: number
  is_adjective: number
  is_comparative_adjective: number
  is_superlative_adjective: number
  is_noun: number
  is_countable_noun: number
  is_uncountable_noun: number
  is_singular_noun: number
  is_plural_noun: number
  is_adverb: number
  is_conjunction: number
  is_determiner: number
  is_preposition: number
  is_predeterminer: number
  is_pronoun: number
  is_prefix: number
  is_sufffix: number
  is_exclamation: number
  is_interjection: number
}

export type Definition = TimestampBase & {
  content: string
  language: string
  source: string | null
  is_verb: boolean
  is_transitive_verb: boolean
  is_intransitive_verb: boolean
  is_adjective: boolean
  is_comparative_adjective: boolean
  is_superlative_adjective: boolean
  is_noun: boolean
  is_countable_noun: boolean
  is_uncountable_noun: boolean
  is_singular_noun: boolean
  is_plural_noun: boolean
  is_adverb: boolean
  is_conjunction: boolean
  is_determiner: boolean
  is_preposition: boolean
  is_predeterminer: boolean
  is_pronoun: boolean
  is_prefix: boolean
  is_sufffix: boolean
  is_exclamation: boolean
  is_interjection: boolean
}

export const partOfSpeechToAbbreviation = {
  is_verb: "v.",
  is_transitive_verb: "vt.",
  is_intransitive_verb: "vi.",
  is_adjective: "adj.",
  // is_comparative_adjective: "comp. adj.",
  // is_superlative_adjective: "superl. adj.",
  is_noun: "n.",
  // is_countable_noun: "count n.",
  // is_uncountable_noun: "uncount n.",
  // is_singular_noun: "sing. n.",
  // is_plural_noun: "pl. n.",
  is_adverb: "adv.",
  is_conjunction: "conj.",
  is_determiner: "det.",
  is_preposition: "prep.",
  is_predeterminer: "predet.",
  is_pronoun: "pron.",
  is_prefix: "pref.",
  is_sufffix: "suff.",
  is_exclamation: "excl.",
  is_interjection: "interj.",
} as const

export type DefinitionCreate = Partial<Definition> & Pick<Definition, "content" | "language">
export type DefinitionRead = Pick<Definition, "id">
export type DefinitionUpdate = Partial<Definition> & Pick<Definition, "id">
export type DefinitionDelete = Pick<Definition, "id">
export type HeadWordDefinitionFind = Pick<HeadWord, "content">

export const DEFINITIONS_TABLE_NAME = "definitions"

export const DEFINITIONS_DDL = `
  CREATE TABLE "${DEFINITIONS_TABLE_NAME}" (
    "id" TEXT PRIMARY KEY NOT NULL,
    "content" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "source" TEXT DEFAULT 'recallable',
    "is_verb" BOOLEAN DEFAULT FALSE,
    "is_transitive_verb" BOOLEAN DEFAULT FALSE,
    "is_intransitive_verb" BOOLEAN DEFAULT FALSE,
    "is_adjective" BOOLEAN DEFAULT FALSE,
    "is_comparative_adjective" BOOLEAN DEFAULT FALSE,
    "is_superlative_adjective" BOOLEAN DEFAULT FALSE,
    "is_noun" BOOLEAN DEFAULT FALSE,
    "is_countable_noun" BOOLEAN DEFAULT FALSE,
    "is_uncountable_noun" BOOLEAN DEFAULT FALSE,
    "is_singular_noun" BOOLEAN DEFAULT FALSE,
    "is_plural_noun" BOOLEAN DEFAULT FALSE,
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
    "created_at" DATETIME NOT NULL DEFAULT (STRFTIME('%FT%R:%fZ','NOW')),
    "updated_at" DATETIME NOT NULL DEFAULT (STRFTIME('%FT%R:%fZ','NOW')),
    "deleted_at" DATETIME
  );
`
