import { act, renderHook, waitFor } from '@testing-library/react'
import useWalletBalance from '../useWalletBalance'
import * as web3 from '@/hooks/wallets/web3'
import * as useWallet from '../useWallet'

import { BigNumber } from 'ethers'
import type { JsonRpcProvider } from '@ethersproject/providers'
import { connectedWalletBuilder } from '@/tests/builders/wallet'
import { POLLING_INTERVAL } from '@/config/constants'

describe('useWalletBalance', () => {
  beforeAll(() => {
    jest.useFakeTimers()
  })

  afterAll(() => {
    jest.useRealTimers()
  })
  it('should poll balance after interval passed', async () => {
    jest.spyOn(web3, 'useWeb3ReadOnly').mockReturnValue({
      getBalance: () => Promise.resolve(BigNumber.from(420)),
    } as unknown as JsonRpcProvider)
    jest.spyOn(useWallet, 'default').mockReturnValue(connectedWalletBuilder().build())

    const { result } = renderHook(useWalletBalance)

    await waitFor(() => {
      expect(result.current[0]).toEqual(BigNumber.from(420))
    })

    jest.spyOn(web3, 'useWeb3ReadOnly').mockReturnValue({
      getBalance: () => Promise.resolve(BigNumber.from(69)),
    } as unknown as JsonRpcProvider)

    // We only poll after the interval passed
    await waitFor(() => {
      expect(result.current[0]).toEqual(BigNumber.from(420))
    })

    act(() => {
      jest.advanceTimersByTime(POLLING_INTERVAL)
    })

    await waitFor(() => {
      expect(result.current[0]).toEqual(BigNumber.from(69))
    })
  })
})
