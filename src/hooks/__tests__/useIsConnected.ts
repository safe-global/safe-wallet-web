import { renderHook } from '@testing-library/react'

import useIsConnected from '@/hooks/useIsConnected'
import * as wallet from '@/hooks/wallets/useWallet'
import type { ConnectedWallet } from '@/services/onboard'
import * as wrongChain from '@/hooks/useIsWrongChain'

describe('useIsConnected', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return true if a wallet is connected on the current chain', async () => {
    jest.spyOn(wrongChain, 'default').mockReturnValue(false)
    jest.spyOn(wallet, 'default').mockReturnValue({
      address: '0x1',
    } as ConnectedWallet)

    const { result } = renderHook(() => useIsConnected())

    expect(result.current).toBe(true)
  })

  it('should return false if no wallet is connected', async () => {
    jest.spyOn(wallet, 'default').mockReturnValue(null)

    const { result } = renderHook(() => useIsConnected())

    expect(result.current).toBe(false)
  })

  it('should return false if a wallet is connected on the wrong chain', async () => {
    jest.spyOn(wrongChain, 'default').mockReturnValue(true)
    jest.spyOn(wallet, 'default').mockReturnValue({
      address: '0x1',
    } as ConnectedWallet)

    const { result } = renderHook(() => useIsConnected())

    expect(result.current).toBe(false)
  })
})
