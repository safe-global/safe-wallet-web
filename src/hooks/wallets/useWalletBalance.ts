import useAsync, { type AsyncResult } from '../useAsync'
import useWallet from './useWallet'
import { useWeb3 } from '@/hooks/wallets/web3'
import { type BigNumber } from 'ethers'

const useWalletBalance = (): AsyncResult<BigNumber | undefined> => {
  const web3 = useWeb3()
  const wallet = useWallet()

  return useAsync<BigNumber | undefined>(() => {
    if (!wallet || !web3) {
      return undefined
    }

    return web3.getBalance(wallet.address, 'latest')
  }, [wallet, web3])
}

export default useWalletBalance
