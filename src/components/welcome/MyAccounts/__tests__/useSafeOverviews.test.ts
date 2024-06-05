import useSafeOverviews from '../useSafeOverviews'
import * as balances from '@/hooks/loadables/useLoadBalances'
import * as sdk from '@safe-global/safe-gateway-typescript-sdk'
import * as useWallet from '@/hooks/wallets/useWallet'
import * as store from '@/store'
import type { Eip1193Provider } from 'ethers'
import { renderHook } from '@testing-library/react'
import { act } from 'react-dom/test-utils'

jest.spyOn(balances, 'useTokenListSetting').mockReturnValue(false)
jest.spyOn(store, 'useAppSelector').mockReturnValue('USD')
jest
  .spyOn(useWallet, 'default')
  .mockReturnValue({ label: 'MetaMask', chainId: '1', address: '0x1234', provider: null as unknown as Eip1193Provider })

describe('useSafeOverviews', () => {
  it('should filter out undefined addresses', async () => {
    const spy = jest.spyOn(sdk, 'getSafeOverviews').mockResolvedValue([])
    const safes = [
      { address: '0x1234', chainId: '1' },
      { address: undefined as unknown as string, chainId: '2' },
      { address: '0x5678', chainId: '3' },
    ]

    renderHook(() => useSafeOverviews(safes))

    await act(() => Promise.resolve())

    expect(spy).toHaveBeenCalledWith(['1:0x1234', '3:0x5678'], {
      currency: 'USD',
      exclude_spam: false,
      trusted: true,
      wallet_address: '0x1234',
    })
  })

  it('should filter out undefined chain ids', async () => {
    const spy = jest.spyOn(sdk, 'getSafeOverviews').mockResolvedValue([])
    const safes = [
      { address: '0x1234', chainId: '1' },
      { address: '0x5678', chainId: undefined as unknown as string },
      { address: '0x5678', chainId: '3' },
    ]

    renderHook(() => useSafeOverviews(safes))

    await act(() => Promise.resolve())

    expect(spy).toHaveBeenCalledWith(['1:0x1234', '3:0x5678'], {
      currency: 'USD',
      exclude_spam: false,
      trusted: true,
      wallet_address: '0x1234',
    })
  })
})
