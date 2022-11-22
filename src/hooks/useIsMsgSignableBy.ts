import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import useIsWrongChain from '@/hooks/useIsWrongChain'
import type { Message } from '@/store/msgsSlice'

const useIsMessageSignableBy = (message: Message, walletAddress: string): boolean => {
  const isSafeOwner = useIsSafeOwner()
  const isWrongChain = useIsWrongChain()
  return isSafeOwner && !isWrongChain && message.confirmations.every(({ owner }) => owner.value !== walletAddress)
}

export default useIsMessageSignableBy
