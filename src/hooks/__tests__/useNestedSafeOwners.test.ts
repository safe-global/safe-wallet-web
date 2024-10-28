import useAllOwnedSafes from '@/components/welcome/MyAccounts/useAllOwnedSafes'
import { useNestedSafeOwners } from '../useNestedSafeOwners'
import useSafeInfo from '@/hooks/useSafeInfo'
import { faker } from '@faker-js/faker'
import { addressExBuilder, extendedSafeInfoBuilder } from '@/tests/builders/safe'
import { renderHook } from '@/tests/test-utils'
import { generateRandomArray } from '@/tests/builders/utils'

jest.mock('@/components/welcome/MyAccounts/useAllOwnedSafes')
jest.mock('@/hooks/useSafeInfo')

describe('useNestedSafeOwners', () => {
  const mockUseSafeInfo = useSafeInfo as jest.MockedFunction<typeof useSafeInfo>
  const mockUseAllOwnedSafes = useAllOwnedSafes as jest.MockedFunction<typeof useAllOwnedSafes>

  const safeAddress = faker.finance.ethereumAddress()
  // Safe with 3 owners
  const mockSafeInfo = {
    safeAddress,
    safe: extendedSafeInfoBuilder()
      .with({ address: { value: safeAddress } })
      .with({ chainId: '1' })
      .with({ owners: generateRandomArray(() => addressExBuilder().build(), { min: 3, max: 3 }) })
      .build(),
    safeLoaded: true,
    safeLoading: false,
  }

  const mockOwners = mockSafeInfo.safe.owners

  beforeAll(() => {
    mockUseSafeInfo.mockReturnValue(mockSafeInfo)
  })

  it('should return null without owned Safes', () => {
    mockUseAllOwnedSafes.mockReturnValue([undefined, undefined, false])
    const { result } = renderHook(() => useNestedSafeOwners())
    expect(result.current).toBeNull()
  })

  it('should return empty list if no owned Safe is in the owners', () => {
    mockUseAllOwnedSafes.mockReturnValue([{ '1': [faker.finance.ethereumAddress()] }, undefined, false])
    const { result } = renderHook(() => useNestedSafeOwners())
    expect(result.current).toEqual([])
  })

  it('should return intersection of owners and owned Safes', () => {
    mockUseAllOwnedSafes.mockReturnValue([
      { '1': [faker.finance.ethereumAddress(), mockOwners[0].value, mockOwners[1].value, mockOwners[2].value] },
      undefined,
      false,
    ])
    const { result } = renderHook(() => useNestedSafeOwners())
    expect(result.current).toEqual([mockOwners[0].value, mockOwners[1].value, mockOwners[2].value])
  })

  it('should ignore Safes on other chains', () => {
    // 1 random Safe and one owner Safe on current chain plus two owner Safes on another chain
    mockUseAllOwnedSafes.mockReturnValue([
      {
        '1': [faker.finance.ethereumAddress(), mockOwners[0].value],
        '100': [mockOwners[1].value, mockOwners[2].value],
      },
      undefined,
      false,
    ])
    const { result } = renderHook(() => useNestedSafeOwners())
    expect(result.current).toEqual([mockOwners[0].value])
  })
})
