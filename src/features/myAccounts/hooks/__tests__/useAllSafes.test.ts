import * as allOwnedSafes from '@/features/myAccounts/hooks/useAllOwnedSafes'
import useAllSafes from '@/features/myAccounts/hooks/useAllSafes'
import * as useWallet from '@/hooks/wallets/useWallet'
import { renderHook } from '@/tests/test-utils'

describe('useAllSafes hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns an empty array if there is no wallet and allOwned is undefined', () => {
    jest.spyOn(useWallet, 'default').mockReturnValue(null)
    jest.spyOn(allOwnedSafes, 'default').mockReturnValue([undefined, undefined, false])

    const { result } = renderHook(() => useAllSafes())

    expect(result.current).toEqual([])
  })

  it('returns an empty array if there are no owned safes', () => {})
})
