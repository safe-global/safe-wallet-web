import useAsync, { type AsyncResult } from '../useAsync'
import useWallet from './useWallet'
import { useWeb3ReadOnly } from '@/hooks/wallets/web3'
import { type BigNumber } from 'ethers'

const useWalletBalance = (): AsyncResult<BigNumber | undefined> => {
  const web3ReadOnly = useWeb3ReadOnly()
  const wallet = useWallet()

  return useAsync<BigNumber | undefined>(() => {
    if (!wallet || !web3ReadOnly) {
      return undefined
    }

    return web3ReadOnly.getBalance(wallet.address, 'latest')
  }, [wallet, web3ReadOnly])
}

export default useWalletBalance
