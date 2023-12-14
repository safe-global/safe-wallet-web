import useAsync, { type AsyncResult } from '../useAsync'
import useWallet from './useWallet'
import { useWeb3ReadOnly } from '@/hooks/wallets/web3'
import { type BigNumber } from 'ethers'
import useIntervalCounter from '../useIntervalCounter'
import { POLLING_INTERVAL } from '@/config/constants'
import { useEffect } from 'react'

const useWalletBalance = (): AsyncResult<BigNumber | undefined> => {
  const web3ReadOnly = useWeb3ReadOnly()
  const wallet = useWallet()
  const [pollingInterval, resetPolling] = useIntervalCounter(POLLING_INTERVAL)

  // Reset polling if new wallet connects
  useEffect(() => {
    resetPolling()
  }, [resetPolling, wallet, web3ReadOnly])

  return useAsync<BigNumber | undefined>(
    () => {
      if (!wallet || !web3ReadOnly) {
        return undefined
      }

      return web3ReadOnly.getBalance(wallet.address, 'latest')
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [wallet, web3ReadOnly, pollingInterval],
    false,
  )
}

export default useWalletBalance
