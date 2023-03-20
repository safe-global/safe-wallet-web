import { renderHook } from '@/tests/test-utils'
import useRemainingRelays from '@/hooks/useRemainingRelays'
import { SAFE_GELATO_RELAY_SERVICE_URL } from '@/config/constants'
import * as useSafeAddress from '@/hooks/useSafeAddress'
import * as useChainId from '@/hooks/useChainId'

const SAFE_ADDRESS = '0x0000000000000000000000000000000000000001'

describe('useRemainingRelays hook', () => {
  beforeEach(() => {
    jest.spyOn(useChainId, 'default').mockReturnValue('5')
    jest.spyOn(useSafeAddress, 'default').mockReturnValue(SAFE_ADDRESS)
  })

  it('should not call fetch if empty safe address', () => {
    jest.spyOn(useSafeAddress, 'default').mockReturnValue('')

    global.fetch = jest.fn()
    const mockFetch = jest.spyOn(global, 'fetch')

    renderHook(() => useRemainingRelays())
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('should call fetch with the right path params', () => {
    global.fetch = jest.fn()
    const mockFetch = jest.spyOn(global, 'fetch')

    const url = `${SAFE_GELATO_RELAY_SERVICE_URL}/5/${SAFE_ADDRESS}`

    renderHook(() => useRemainingRelays())
    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(mockFetch).toHaveBeenCalledWith(url)
  })
})
