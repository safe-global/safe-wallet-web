import { useNestedSafeOwners } from '../useNestedSafeOwners'
import useSafeInfo from '@/hooks/useSafeInfo'
import { faker } from '@faker-js/faker'
import { addressExBuilder, extendedSafeInfoBuilder } from '@/tests/builders/safe'
import { renderHook } from '@/tests/test-utils'
import { generateRandomArray } from '@/tests/builders/utils'
import useOwnedSafes from '../useOwnedSafes'

jest.mock('@/hooks/useOwnedSafes')
jest.mock('@/hooks/useSafeInfo')

describe('useNestedSafeOwners', () => {
  const mockUseSafeInfo = useSafeInfo as jest.MockedFunction<typeof useSafeInfo>
  const mockUseOwnedSafes = useOwnedSafes as jest.MockedFunction<typeof useOwnedSafes>

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

  it('should return undefined without owned Safes', () => {
    mockUseOwnedSafes.mockReturnValue({})
    const { result } = renderHook(() => useNestedSafeOwners())
    expect(result.current).toEqual(undefined)
  })

  it('should return empty list if no owned Safe is in the owners', () => {
    mockUseOwnedSafes.mockReturnValue({ '1': [faker.finance.ethereumAddress()] })
    const { result } = renderHook(() => useNestedSafeOwners())
    expect(result.current).toEqual([])
  })

  it('should return intersection of owners and owned Safes', () => {
    mockUseOwnedSafes.mockReturnValue({
      '1': [faker.finance.ethereumAddress(), mockOwners[0].value, mockOwners[1].value, mockOwners[2].value],
    })
    const { result } = renderHook(() => useNestedSafeOwners())
    expect(result.current).toEqual([mockOwners[0].value, mockOwners[1].value, mockOwners[2].value])
  })
})
