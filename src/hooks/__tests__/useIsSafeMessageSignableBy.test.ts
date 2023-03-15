import type { SafeMessage } from '@safe-global/safe-gateway-typescript-sdk'

import { renderHook } from '@/tests/test-utils'
import * as useIsSafeOwnerHook from '@/hooks/useIsSafeOwner'
import * as useIsWrongChainHook from '@/hooks/useIsWrongChain'
import useIsSafeMessageSignableBy from '../useIsSafeMessageSignableBy'

describe('useIsSafeMessageSignableBy', () => {
  it('returns true if the message is signable by the wallet', () => {
    jest.spyOn(useIsSafeOwnerHook, 'default').mockImplementation(() => true)
    jest.spyOn(useIsWrongChainHook, 'default').mockImplementation(() => false)

    const message = {
      confirmations: [
        {
          owner: {
            value: '0x123',
          },
        },
      ],
    } as SafeMessage

    const address = '0x456'

    const { result } = renderHook(() => useIsSafeMessageSignableBy(message, address))
    expect(result.current).toBe(true)
  })

  it('returns false if not connect as an owner', () => {
    jest.spyOn(useIsSafeOwnerHook, 'default').mockImplementation(() => false)
    jest.spyOn(useIsWrongChainHook, 'default').mockImplementation(() => false)

    const message = {
      confirmations: [
        {
          owner: {
            value: '0x123',
          },
        },
      ],
    } as SafeMessage

    const address = '0x456'

    const { result } = renderHook(() => useIsSafeMessageSignableBy(message, address))
    expect(result.current).toBe(false)
  })

  it('returns false if connected to the wrong chain', () => {
    jest.spyOn(useIsSafeOwnerHook, 'default').mockImplementation(() => true)
    jest.spyOn(useIsWrongChainHook, 'default').mockImplementation(() => true)

    const message = {
      confirmations: [
        {
          owner: {
            value: '0x123',
          },
        },
      ],
    } as SafeMessage

    const address = '0x456'

    const { result } = renderHook(() => useIsSafeMessageSignableBy(message, address))
    expect(result.current).toBe(false)
  })

  it('returns false if the message is already signed by the connected wallet', () => {
    jest.spyOn(useIsSafeOwnerHook, 'default').mockImplementation(() => true)
    jest.spyOn(useIsWrongChainHook, 'default').mockImplementation(() => false)
    const message = {
      confirmations: [
        {
          owner: {
            value: '0x123',
          },
        },
      ],
    } as SafeMessage

    const address = '0x123'

    const { result } = renderHook(() => useIsSafeMessageSignableBy(message, address))
    expect(result.current).toBe(false)
  })
})
