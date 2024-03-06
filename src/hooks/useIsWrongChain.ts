import useChainId from '@/hooks/useChainId'
import useWallet from '@/hooks/wallets/useWallet'

const useIsWrongChain = (): boolean => {
  const chainId = useChainId() // Target chain
  const wallet = useWallet() // wallet chain
  return !wallet || !chainId ? false : wallet.chainId !== chainId
}

export default useIsWrongChain
