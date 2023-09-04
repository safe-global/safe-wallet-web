import useChainId from '@/hooks/useChainId'
import useWallet from '@/hooks/wallets/useWallet'

const useIsWrongChain = (): boolean => {
  const chainId = useChainId()
  const wallet = useWallet()
  return !wallet || !chainId ? false : wallet.chainId !== chainId
}

export default useIsWrongChain
