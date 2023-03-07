import useChainId from '@/hooks/useChainId'
import useWallet from '@/hooks/wallets/useWallet'

// TODO: Remove this later
const useIsWrongChain = (): boolean => {
  const chainId = useChainId()
  const wallet = useWallet()
  return false
}

export default useIsWrongChain
