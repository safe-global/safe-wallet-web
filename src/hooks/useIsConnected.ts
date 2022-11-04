import useIsWrongChain from '@/hooks/useIsWrongChain'
import useWallet from '@/hooks/wallets/useWallet'

const useIsConnected = () => {
  const wallet = useWallet()
  const isWrongChain = useIsWrongChain()

  const isConnected = !!wallet && !isWrongChain
  return isConnected
}

export default useIsConnected
