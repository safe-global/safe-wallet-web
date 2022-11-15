import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import type { Message } from '@/hooks/useMessages'

const useIsMessageSignableBy = (message: Message, walletAddress: string): boolean => {
  const isSafeOwner = useIsSafeOwner()
  return isSafeOwner ? message.confirmations.every(({ owner }) => owner.value !== walletAddress) : false
}

export default useIsMessageSignableBy
