import { getRecoveredSafeInfo } from '@/services/recovery/transaction-list'
import { safeInfoBuilder } from '@/tests/builders/safe'
import { renderHook } from '@/tests/test-utils'
import { faker } from '@faker-js/faker'
import { BigNumber } from 'ethers'
import { useIsValidRecoveryExecution } from '../useIsValidRecoveryExecution'
import { useRecoveredSafeInfo } from '../useRecoveredSafeInfo'
import useSafeInfo from '../useSafeInfo'

jest.mock('../useIsValidRecoveryExecution')
jest.mock('../useSafeInfo')
jest.mock('@/services/recovery/transaction-list')

const mockUseIsValidRecoveryExecution = useIsValidRecoveryExecution as jest.MockedFunction<
  typeof useIsValidRecoveryExecution
>
const mockUseSafeInfo = useSafeInfo as jest.MockedFunction<typeof useSafeInfo>
const mockGetRecoveredSafeInfo = getRecoveredSafeInfo as jest.MockedFunction<typeof getRecoveredSafeInfo>

describe('useIsValidRecoveryExecution', () => {
  it('should return undefined if the execution is invalid', () => {
    mockUseIsValidRecoveryExecution.mockReturnValue([false, undefined, false])
    mockUseSafeInfo.mockReturnValue({ safe: safeInfoBuilder().build() } as any)
    const recovery = {}

    const { result } = renderHook(() => useRecoveredSafeInfo(recovery as any))
    expect(result.current).toStrictEqual([undefined, undefined, false])
  })

  it('should return undefined and the error if the execution threw', () => {
    const error = new Error('Some error')
    mockUseIsValidRecoveryExecution.mockReturnValue([false, error, false])
    mockUseSafeInfo.mockReturnValue({ safe: safeInfoBuilder().build() } as any)
    const recovery = {}

    const { result } = renderHook(() => useRecoveredSafeInfo(recovery as any))
    expect(result.current).toStrictEqual([undefined, error, false])
  })

  it('should return the new setup if could be decoded', () => {
    const safe = safeInfoBuilder().build()
    mockUseIsValidRecoveryExecution.mockReturnValue([true, undefined, false])
    mockUseSafeInfo.mockReturnValue({ safe } as any)
    mockGetRecoveredSafeInfo.mockReturnValue(safe)
    const recovery = { args: { to: faker.finance.ethereumAddress(), value: '', data: faker.string.hexadecimal() } }

    const { result } = renderHook(() => useRecoveredSafeInfo(recovery as any))
    expect(result.current).toStrictEqual([safe, undefined, false])
  })

  it('should return undefined and the error if decoding the new setup was not possible', () => {
    const error = new Error('Some error')
    mockUseIsValidRecoveryExecution.mockReturnValue([true, undefined, false])
    mockUseSafeInfo.mockReturnValue({ safe: safeInfoBuilder().build() } as any)
    mockGetRecoveredSafeInfo.mockImplementation(() => {
      throw error
    })
    const recovery = { args: { to: faker.finance.ethereumAddress(), value: '', data: faker.string.hexadecimal() } }

    const { result } = renderHook(() => useRecoveredSafeInfo(recovery as any))
    expect(result.current).toStrictEqual([undefined, error, false])
  })
})
