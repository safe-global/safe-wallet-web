import { useParticleProvider } from '@particle-network/connectkit'
import type { AsyncResult } from '../useAsync'
import useAsync from '../useAsync'
import useWallet from './useWallet'

const useWalletBalance = (): AsyncResult<bigint | undefined> => {
  const wallet = useWallet()

  const provider = useParticleProvider() as any

  return useAsync<bigint | undefined>(async () => {
    if (!wallet || !provider) {
      return undefined
    }
    let balance = await provider.request({
      method: 'eth_getBalance',
      params: [wallet.address, 'latest'],
      chainId: wallet.chainId,
    })
    balance = BigInt(balance)

    return balance
  }, [wallet, provider])
}

export default useWalletBalance
