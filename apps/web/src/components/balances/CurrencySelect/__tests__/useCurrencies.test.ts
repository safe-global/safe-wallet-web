import { act, renderHook } from '@testing-library/react'
import { getFiatCurrencies } from '@safe-global/safe-gateway-typescript-sdk'
import useCurrencies from '../useCurrencies'
import { Errors, logError } from '@/services/exceptions'

jest.mock('@safe-global/safe-gateway-typescript-sdk', () => ({
  getFiatCurrencies: jest.fn(),
}))

jest.mock('@/services/exceptions', () => {
  const originalModule = jest.requireActual('@/services/exceptions')

  return {
    ...originalModule, // this will keep the original exports
    logError: jest.fn(), // this will override logError with a mock function
  }
})

describe('useCurrencies', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch and return the list of ISO 4217 currencies', async () => {
    const iso4217Currencies = ['USD', 'EUR', 'GBP']
    const mockCurrencies = [...iso4217Currencies, 'SATS']
    const getFiatCurrenciesMock = jest.fn(async () => Promise.resolve(mockCurrencies))
    const myMock = getFiatCurrencies as jest.Mock
    myMock.mockImplementation(getFiatCurrenciesMock)

    const { result, rerender } = renderHook(() => useCurrencies())

    expect(result.current).toBeUndefined()

    await act(async () => {
      rerender()
    })

    expect(result.current).toEqual(iso4217Currencies)
    expect(getFiatCurrenciesMock).toHaveBeenCalledTimes(1)
  })

  it('should log an error if fetching currencies fails', async () => {
    const mockError = new Error('Failed to fetch currencies')
    const myMock = getFiatCurrencies as jest.Mock
    myMock.mockRejectedValue(mockError)

    const { rerender } = renderHook(() => useCurrencies())

    await act(async () => {
      rerender()
    })

    expect(logError).toHaveBeenCalledWith(Errors._607, mockError.message)
  })
})
