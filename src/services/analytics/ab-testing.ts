import local from '../local-storage/local'

export enum AbTest {
  SAFE_CREATION = 'safe_creation',
}

export type AbTestEvent = Partial<{ [key in AbTest]: true }>

const AB_TEST_KEY = 'abTest'

const setLocalAbTest = (abTest: AbTest[]): void => {
  return local.setItem(AB_TEST_KEY, abTest)
}

const getLocalAbTest = (): AbTest[] => {
  const abTest = local.getItem<AbTest[]>(AB_TEST_KEY) || []

  // Remove any legacy AB tests
  const sanitizedAbTest = abTest.filter((test) => {
    return Object.values(AbTest).includes(test)
  })

  if (sanitizedAbTest.length !== abTest.length) {
    setLocalAbTest(sanitizedAbTest)
  }

  return sanitizedAbTest
}

export const addAbTest = (test: AbTest): void => {
  const abTest = getLocalAbTest()

  if (!abTest.includes(test)) {
    setLocalAbTest([...abTest, test])
  }
}

export const getAbTestEvent = (): AbTestEvent => {
  const abTest = getLocalAbTest()

  return abTest.reduce<AbTestEvent>((acc, test) => {
    acc[test] = true
    return acc
  }, {})
}
