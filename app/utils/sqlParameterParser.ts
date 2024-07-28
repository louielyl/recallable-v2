export function parseParamsToSqlParams(parameters: Record<string, any>): Record<string, any> {
  return Object.entries(parameters).reduce((acc: Record<string, any>, [key, value]) => {
    acc["$" + key] = value instanceof Date ? value.toISOString() : value
    return acc
  }, {})
}
