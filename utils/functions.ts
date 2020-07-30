/**
 * Turns "AA" into
 */
export function generateColName(index: number) {
  const ordA = "A".charCodeAt(0);
  const ordZ = "Z".charCodeAt(0);
  const len = ordZ - ordA + 1;

  let s = "";
  while (index >= 0) {
    s = String.fromCharCode((index % len) + ordA) + s;
    index = Math.floor(index / len) - 1;
  }
  return s;
}

/**
 * Turns "= A1 + 100 - B2" into ["A1","100","B2"]
 */
export function extractValuesArray(value: string) {
  return value
    .substring(1)
    .replace(/\s/g, "")
    .split(/[\s+-]+/);
}

/**
 * Turns "= A1 + 100 - B2" into ["+", "-"]
 */
export function extractOperatorsArray(value: string) {
  return value
    .substring(1)
    .replace(/\s/g, "")
    .split(/[^\s+-]+/);
}

/**
 * Turns "AA1" into ["AA", "1"]
 */
export function splitBetweenNumbers(value: string) {
  return value.split(/(\d+)/).filter(Boolean);
}
