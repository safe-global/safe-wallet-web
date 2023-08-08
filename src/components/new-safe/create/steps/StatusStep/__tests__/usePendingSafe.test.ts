import { renderHook } from '@/tests/test-utils'
import { usePendingSafe } from '../usePendingSafe'

import { hexZeroPad } from 'ethers/lib/utils'
import { useCurrentChain } from '@/hooks/useChains'

// mock useCurrentChain
jest.mock('@/hooks/useChains', () => ({
  useCurrentChain: jest.fn(() => ({
    shortName: 'gor',
    chainId: '5',
    chainName: 'Goerli',
    features: [],
  })),
}))

describe('usePendingSafe()', () => {
  const mockPendingSafe1 = {
    name: 'joyful-rinkeby-safe',
    threshold: 1,
    owners: [],
    saltNonce: 123,
    address: hexZeroPad('0x10', 20),
  }
  const mockPendingSafe2 = {
    name: 'joyful-rinkeby-safe',
    threshold: 1,
    owners: [],
    saltNonce: 123,
    address: hexZeroPad('0x10', 20),
  }

  beforeEach(() => {
    window.localStorage.clear()
  })
  it('Should initially be undefined', () => {
    const { result } = renderHook(() => usePendingSafe())
    expect(result.current[0]).toBeUndefined()
  })

  it('Should set the pendingSafe per ChainId', async () => {
    const { result, rerender } = renderHook(() => usePendingSafe())

    result.current[1](mockPendingSafe1)

    rerender()

    expect(result.current[0]).toEqual(mockPendingSafe1)
    ;(useCurrentChain as jest.Mock).mockImplementation(() => ({
      shortName: 'eth',
      chainId: '1',
      chainName: 'Ethereum',
      features: [],
    }))

    rerender()
    expect(result.current[0]).toEqual(undefined)

    result.current[1](mockPendingSafe2)
    rerender()
    expect(result.current[0]).toEqual(mockPendingSafe2)
    ;(useCurrentChain as jest.Mock).mockImplementation(() => ({
      shortName: 'gor',
      chainId: '5',
      chainName: 'Goerli',
      features: [],
    }))
    rerender()
    expect(result.current[0]).toEqual(mockPendingSafe1)
  })
})
