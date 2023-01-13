import { renderHook } from '@/tests/test-utils'
import { useRankedSafeApps } from '@/hooks/safe-apps/useRankedSafeApps'
import type { SafeAppData } from '@safe-global/safe-gateway-typescript-sdk'
import { SafeAppsTag } from '@/config/constants'

const getMockSafeApp = (props: Partial<SafeAppData>) => {
  return {
    tags: [],
    ...props,
  } as SafeAppData
}

describe('useRankedSafeApps', () => {
  it('returns an empty array if there are no safe apps', () => {
    const { result } = renderHook(() => useRankedSafeApps([], []))

    expect(result.current).toStrictEqual([])
  })

  it('returns 5 safe apps at most', () => {
    const mockSafeApp1 = getMockSafeApp({ id: 1 })
    const mockSafeApp2 = getMockSafeApp({ id: 2 })
    const mockSafeApp3 = getMockSafeApp({ id: 3 })
    const mockSafeApp4 = getMockSafeApp({ id: 4 })
    const mockSafeApp5 = getMockSafeApp({ id: 5 })
    const mockSafeApp6 = getMockSafeApp({ id: 6 })

    const { result } = renderHook(() =>
      useRankedSafeApps([mockSafeApp1, mockSafeApp2, mockSafeApp3, mockSafeApp4, mockSafeApp5, mockSafeApp6], []),
    )

    expect(result.current.length).toEqual(5)
  })

  it('excludes featured safe apps', () => {
    const mockSafeApp1 = getMockSafeApp({ id: 1, tags: [SafeAppsTag.DASHBOARD_FEATURED] })
    const mockSafeApp2 = getMockSafeApp({ id: 2, tags: [SafeAppsTag.DASHBOARD_FEATURED] })
    const mockSafeApp3 = getMockSafeApp({ id: 3 })
    const mockSafeApp4 = getMockSafeApp({ id: 4 })
    const mockSafeApp5 = getMockSafeApp({ id: 5 })

    const { result } = renderHook(() =>
      useRankedSafeApps([mockSafeApp1, mockSafeApp2, mockSafeApp3, mockSafeApp4, mockSafeApp5], []),
    )

    expect(result.current.length).toEqual(3)
  })

  it('returns pinned apps first', () => {
    const mockSafeApp1 = getMockSafeApp({ id: 1 })
    const mockSafeApp2 = getMockSafeApp({ id: 2 })
    const mockSafeApp3 = getMockSafeApp({ id: 3 })
    const mockSafeApp4 = getMockSafeApp({ id: 4 })
    const mockSafeApp5 = getMockSafeApp({ id: 5 })

    const mockPinnedApp1 = getMockSafeApp({ id: 6 })
    const mockPinnedApp2 = getMockSafeApp({ id: 7 })

    const { result } = renderHook(() =>
      useRankedSafeApps(
        [mockSafeApp1, mockSafeApp2, mockSafeApp3, mockSafeApp4, mockSafeApp5],
        [mockPinnedApp1, mockPinnedApp2],
      ),
    )

    expect(result.current[0]).toStrictEqual(mockPinnedApp1)
    expect(result.current[1]).toStrictEqual(mockPinnedApp2)
  })
})
