export type DBHeadWord = {
  id: string
  content: string | null
  created_at: string | null
  updated_at: string | null
  deleted_at: string | null
}

export type HeadWord = {
  id: string
  content: string | null
  created_at: Date | null
  updated_at: Date | null
  deleted_at: Date | null
}

export type HeadWordCreate = Partial<HeadWord> & Pick<HeadWord, "content">
export type HeadWordRead = Pick<HeadWord, "id">
export type HeadWordUpdate = Partial<HeadWord> & Pick<HeadWord, "id">
export type HeadWordDelete = Pick<HeadWord, "content">
