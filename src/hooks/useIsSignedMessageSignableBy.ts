import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import useIsWrongChain from '@/hooks/useIsWrongChain'
import type { SignedMessage } from '@/store/signedMessagesSlice'

const useIsSignedMessageSignableBy = (message: SignedMessage, walletAddress: string): boolean => {
  const isSafeOwner = useIsSafeOwner()
  const isWrongChain = useIsWrongChain()
  return isSafeOwner && !isWrongChain && message.confirmations.every(({ owner }) => owner.value !== walletAddress)
}

export default useIsSignedMessageSignableBy
