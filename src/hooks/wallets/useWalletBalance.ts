import useAsync from '../useAsync'
import useWallet from './useWallet'

const useWalletBalance = () => {
  const wallet = useWallet()

  return useAsync<BigInt | undefined>(async () => {
    if (!wallet) {
      return undefined
    }
    const balanceString = await wallet.provider.request({
      method: 'eth_getBalance',
      params: [wallet.address, 'latest'],
    })
    return BigInt(balanceString)
  }, [wallet])
}

export default useWalletBalance
