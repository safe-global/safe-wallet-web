import '@testing-library/react-native/extend-expect'

jest.useFakeTimers()

/**
 *  This mock is necessary because useFonts is async and we get an error
 *  Warning: An update to FontProvider inside a test was not wrapped in act(...)
 */
jest.mock('expo-font', () => ({
  useFonts: () => [true],
}))

jest.mock('react-native-mmkv', () => ({
  MMKV: function () {
    // @ts-ignore
    this.getString = jest.fn()
    // @ts-ignore
    this.delete = jest.fn()
    // @ts-ignore
    this.set = jest.fn()
  },
}))

jest.mock('redux-persist', () => {
  const real = jest.requireActual('redux-persist')
  return {
    ...real,
    persistReducer: jest.fn().mockImplementation((config, reducers) => reducers),
  }
})
jest.mock('redux-devtools-expo-dev-plugin', () => ({
  default: () => jest.fn(),
}))
