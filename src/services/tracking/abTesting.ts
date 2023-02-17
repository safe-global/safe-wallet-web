/**
 * Holds current A/B test identifiers.
 */
export const enum AbTest {}

let _abTest: AbTest | null = null

export const setAbTest = (abTest: AbTest): void => {
  _abTest = abTest
}

export const getAbTest = (): AbTest | null => {
  return _abTest
}
