export const enum AbTest {
  SAFE_CREATION = 'safe_creation',
}

let _abTest: AbTest | null = null

export const setAbTest = (abTest: AbTest): void => {
  _abTest = abTest
}

export const getAbTest = (): AbTest | null => {
  return _abTest
}
