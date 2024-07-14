import { DBTimestampBase, TimestampBase } from "./base"

export type DBHeadWord = DBTimestampBase & {
  content: string | null
}

export type HeadWord = TimestampBase & {
  content: string | null
}

export type HeadWordCreate = Partial<HeadWord> & Pick<HeadWord, "content">
export type HeadWordRead = Pick<HeadWord, "id">
export type HeadWordUpdate = Partial<HeadWord> & Pick<HeadWord, "id">
export type HeadWordDelete = Pick<HeadWord, "content">
