export type Base = {
  id: string
}

export type DBTimestampBase = Base & {
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export type TimestampBase = Base & {
  created_at: Date | null
  updated_at: Date | null
  deleted_at: Date | null
}
