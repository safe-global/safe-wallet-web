import * as spendingLimit from '@/services/contracts/spendingLimitContracts'
import { JsonRpcProvider } from '@ethersproject/providers'
import { ZERO_ADDRESS } from '@safe-global/safe-core-sdk/dist/src/utils/constants'
import type { AllowanceModule } from '@/types/contracts'
import {
  getSpendingLimits,
  getTokenAllowanceForDelegate,
  getTokensForDelegate,
} from '../loadables/useLoadSpendingLimits'
import { BigNumber } from '@ethersproject/bignumber'

const mockProvider = new JsonRpcProvider()
const mockModule = {
  value: '0x1',
}

describe('getSpendingLimits', () => {
  beforeEach(() => {
    jest.resetModules()
    jest.resetAllMocks()
  })

  it('should return undefined if no spending limit module address was found', async () => {
    jest.spyOn(spendingLimit, 'getSpendingLimitModuleAddress').mockReturnValue(undefined)

    const result = await getSpendingLimits(mockProvider, [], ZERO_ADDRESS, '4')

    expect(result).toBeUndefined()
  })

  it('should return undefined if the safe has no spending limit module', async () => {
    jest.spyOn(spendingLimit, 'getSpendingLimitModuleAddress').mockReturnValue('0x1')

    const result = await getSpendingLimits(mockProvider, [], ZERO_ADDRESS, '4')

    expect(result).toBeUndefined()
  })

  it('should fetch a list of delegates', async () => {
    const getDelegatesMock = jest.fn(() => ({ results: [] }))
    jest.spyOn(spendingLimit, 'getSpendingLimitModuleAddress').mockReturnValue('0x1')
    jest.spyOn(spendingLimit, 'getSpendingLimitContract').mockImplementation(
      jest.fn(() => {
        return {
          getDelegates: getDelegatesMock,
        } as unknown as AllowanceModule
      }),
    )

    const mockModule = {
      value: '0x1',
    }

    await getSpendingLimits(mockProvider, [mockModule], ZERO_ADDRESS, '4')

    expect(getDelegatesMock).toHaveBeenCalledWith(ZERO_ADDRESS, 0, 100)
  })

  it('should return a flat list of spending limits', async () => {
    const getDelegatesMock = jest.fn(() => ({ results: ['0x2', '0x3'] }))
    const getTokensMock = jest.fn(() => ['0x10', '0x11'])
    const getTokenAllowanceMock = jest.fn(() => [
      BigNumber.from(1),
      BigNumber.from(0),
      BigNumber.from(0),
      BigNumber.from(0),
      BigNumber.from(0),
    ])

    jest.spyOn(spendingLimit, 'getSpendingLimitModuleAddress').mockReturnValue('0x1')
    jest.spyOn(spendingLimit, 'getSpendingLimitContract').mockImplementation(
      jest.fn(() => {
        return {
          getDelegates: getDelegatesMock,
          getTokens: getTokensMock,
          getTokenAllowance: getTokenAllowanceMock,
        } as unknown as AllowanceModule
      }),
    )

    const result = await getSpendingLimits(mockProvider, [mockModule], ZERO_ADDRESS, '4')

    expect(result?.length).toBe(4)
  })

  it('should filter out empty allowances', async () => {
    const getDelegatesMock = jest.fn(() => ({ results: ['0x2', '0x3'] }))
    const getTokensMock = jest.fn(() => ['0x10', '0x11'])
    const getTokenAllowanceMock = jest.fn(() => [
      BigNumber.from(0),
      BigNumber.from(0),
      BigNumber.from(0),
      BigNumber.from(0),
      BigNumber.from(0),
    ])

    jest.spyOn(spendingLimit, 'getSpendingLimitModuleAddress').mockReturnValue('0x1')
    jest.spyOn(spendingLimit, 'getSpendingLimitContract').mockImplementation(
      jest.fn(() => {
        return {
          getDelegates: getDelegatesMock,
          getTokens: getTokensMock,
          getTokenAllowance: getTokenAllowanceMock,
        } as unknown as AllowanceModule
      }),
    )

    const result = await getSpendingLimits(mockProvider, [mockModule], ZERO_ADDRESS, '4')

    expect(result?.length).toBe(0)
  })
})

describe('getTokensForDelegate', () => {
  it('should fetch tokens for a given delegate', async () => {
    const getTokensMock = jest.fn(() => [])
    const mockContract = { getTokens: getTokensMock } as unknown as AllowanceModule

    await getTokensForDelegate(mockContract, ZERO_ADDRESS, '0x1')

    expect(getTokensMock).toHaveBeenCalledWith(ZERO_ADDRESS, '0x1')
  })
})

describe('getTokenAllowanceForDelegate', () => {
  it('should return contract values as strings', async () => {
    const getTokenAllowanceMock = jest.fn(() => [
      BigNumber.from(0),
      BigNumber.from(0),
      BigNumber.from(0),
      BigNumber.from(0),
      BigNumber.from(0),
    ])
    const mockContract = { getTokenAllowance: getTokenAllowanceMock } as unknown as AllowanceModule

    const result = await getTokenAllowanceForDelegate(mockContract, ZERO_ADDRESS, '0x1', '0x10')

    expect(result.beneficiary).toBe('0x1')
    expect(result.nonce).toBe('0')
    expect(result.amount).toBe('0')
    expect(result.spent).toBe('0')
    expect(result.lastResetMin).toBe('0')
    expect(result.resetTimeMin).toBe('0')
  })
})
