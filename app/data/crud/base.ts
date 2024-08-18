import { parseParamsToSqlParams } from "app/utils/sqlParameterParser"
import { SQLiteDatabase } from "expo-sqlite"

export class DBStatement {
  tableName: string

  constructor(tableName: string) {
    this.tableName = tableName
  }

  getSelectStatement() {
    return `
      SELECT * FROM ${this.tableName} WHERE id = $id;
    `
  }

  getSelectAllStatement() {
    return `
      SELECT * FROM ${this.tableName};
    `
  }

  getInsertStatement(params: Record<string, any>) {
    return `
      INSERT INTO ${this.tableName} 
      (${["id", Object.keys(params)].join(", ")}) 
      VALUES 
      (${["$id", Object.keys(parseParamsToSqlParams(params))].join(", ")});
    `
  }

  getUpdateStatement(params: Record<string, any>) {
    return `
      UPDATE ${this.tableName} SET 
      (${Object.keys(params).join(", ")}) = 
      (${Object.keys(parseParamsToSqlParams(params)).join(", ")})
      WHERE id = $id;
    `
  }

  getDeleteStatement() {
    return `
      DELETE FROM ${this.tableName} 
      WHERE id = $id;
    `
  }
}

export class DBAPI {
  engine: SQLiteDatabase | any

  constructor(engine: SQLiteDatabase | any) {
    this.engine = engine
  }

  run(statement: string, params: Record<string, any> = {}) {
    if (this.engine instanceof SQLiteDatabase) {
      return this.engine.runAsync(statement, params)
    } else {
      return this.engine.run(statement, params)
    }
  }

  get(statement: string, params: Record<string, any> = {}) {
    if (this.engine instanceof SQLiteDatabase) {
      return this.engine.getFirstAsync(statement, params)
    } else {
      return this.engine.get(statement, params)
    }
  }

  find(statement: string, params: Record<string, any> = {}) {
    if (this.engine instanceof SQLiteDatabase) {
      return this.engine.getAllAsync(statement, params)
    } else {
      return this.engine.all(statement, params)
    }
  }

  close() {
    if (this.engine instanceof SQLiteDatabase) {
      return
    } else {
      return this.engine.close()
    }
  }
}
