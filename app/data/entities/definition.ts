import { DBTimestampBase, TimestampBase } from "./base"

export type DBDefinition = DBTimestampBase & {
  content: string
  language: string
  is_verb: number
  is_adjective: number
  is_comparative_adjective: number
  is_superlative_adjective: number
  is_countable_noun: number
  is_uncountable_noun: number
  is_singular_noun: number
  is_plural_noun: number
  is_transitive_verb: number
  is_intransitive_verb: number
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
  is_verb: boolean
  is_adjective: boolean
  is_comparative_adjective: boolean
  is_superlative_adjective: boolean
  is_countable_noun: boolean
  is_uncountable_noun: boolean
  is_singular_noun: boolean
  is_plural_noun: boolean
  is_transitive_verb: boolean
  is_intransitive_verb: boolean
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

export type DefinitionCreate = Partial<Definition> & Pick<Definition, "content" | "language">
export type DefinitionRead = Pick<Definition, "id">
export type DefinitionUpdate = Partial<Definition> & Pick<Definition, "id">
export type DefinitionDelete = Pick<Definition, "id">
