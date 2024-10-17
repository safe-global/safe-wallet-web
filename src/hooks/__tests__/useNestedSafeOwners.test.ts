import useAllSafes from '@/components/welcome/MyAccounts/useAllSafes'
import { useNestedSafeOwners } from '../useNestedSafeOwners'
import useSafeInfo from '@/hooks/useSafeInfo'
import { faker } from '@faker-js/faker'
import { addressExBuilder, extendedSafeInfoBuilder } from '@/tests/builders/safe'
import { renderHook } from '@/tests/test-utils'
import { generateRandomArray } from '@/tests/builders/utils'

jest.mock('@/components/welcome/MyAccounts/useAllSafes')
jest.mock('@/hooks/useSafeInfo')

describe('useNestedSafeOwners', () => {
  const mockUseSafeInfo = useSafeInfo as jest.MockedFunction<typeof useSafeInfo>
  const mockUseAllSafes = useAllSafes as jest.MockedFunction<typeof useAllSafes>

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
    mockUseAllSafes.mockReturnValue(undefined)
    const { result } = renderHook(() => useNestedSafeOwners())
    expect(result.current).toBeNull()
  })

  it('should return empty list if no owned Safe is in the owners', () => {
    mockUseAllSafes.mockReturnValue([
      {
        address: faker.finance.ethereumAddress(),
        chainId: '1',
        isWatchlist: false,
      },
    ])
    const { result } = renderHook(() => useNestedSafeOwners())
    expect(result.current).toEqual([])
  })

  it('should return intersection of owners and owned Safes', () => {
    mockUseAllSafes.mockReturnValue([
      {
        address: faker.finance.ethereumAddress(),
        chainId: '1',
        isWatchlist: false,
      },
      {
        address: mockOwners[0].value,
        chainId: '1',
        isWatchlist: false,
      },
      {
        address: mockOwners[1].value,
        chainId: '1',
        isWatchlist: false,
      },
      {
        address: mockOwners[2].value,
        chainId: '1',
        isWatchlist: false,
      },
    ])
    const { result } = renderHook(() => useNestedSafeOwners())
    expect(result.current?.map((value) => value.address)).toEqual([
      mockOwners[0].value,
      mockOwners[1].value,
      mockOwners[2].value,
    ])
  })

  it('should ignore watchlist Safes', () => {
    mockUseAllSafes.mockReturnValue([
      {
        address: faker.finance.ethereumAddress(),
        chainId: '1',
        isWatchlist: false,
      },
      {
        address: mockOwners[0].value,
        chainId: '1',
        isWatchlist: true,
      },
      {
        address: mockOwners[1].value,
        chainId: '1',
        isWatchlist: true,
      },
    ])
    const { result } = renderHook(() => useNestedSafeOwners())
    expect(result.current?.map((value) => value.address)).toEqual([])
  })

  it('should ignore Safes on other chains', () => {
    // 1 random Safe amd one owner Safe on current chain plus two owner Safes on another chain
    mockUseAllSafes.mockReturnValue([
      {
        address: faker.finance.ethereumAddress(),
        chainId: '1',
        isWatchlist: false,
      },
      {
        address: mockOwners[0].value,
        chainId: '100',
        isWatchlist: false,
      },
      {
        address: mockOwners[0].value,
        chainId: '1',
        isWatchlist: false,
      },
      {
        address: mockOwners[1].value,
        chainId: '100',
        isWatchlist: false,
      },
    ])
    const { result } = renderHook(() => useNestedSafeOwners())
    expect(result.current?.map((value) => value.address)).toEqual([mockOwners[0].value])
  })
})
