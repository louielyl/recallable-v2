export function parseParamsToSqlParams(parameters: Record<string, any>): Record<string, any> {
  return Object.entries(parameters).reduce((acc: Record<string, any>, [key, value]) => {
    acc["$" + key] = value
    return acc
  }, {})
}
