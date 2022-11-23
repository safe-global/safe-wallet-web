import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import useIsWrongChain from '@/hooks/useIsWrongChain'
import type { SafeMessage } from '@/store/safeMessagesSlice'

const useIsSafeMessageSignableBy = (message: SafeMessage, walletAddress: string): boolean => {
  const isSafeOwner = useIsSafeOwner()
  const isWrongChain = useIsWrongChain()
  return isSafeOwner && !isWrongChain && message.confirmations.every(({ owner }) => owner.value !== walletAddress)
}

export default useIsSafeMessageSignableBy
