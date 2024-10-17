import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import useSafeAddress from '@/hooks/useSafeAddress'
import { MAX_ASK_AGAIN_DELAY } from '@/features/targetedOutreach/constants'
import { useAppSelector } from '@/store'
import { selectCookieBanner } from '@/store/popupSlice'

const isTargetedSafeAddress = (safeAddress: string): boolean => {
  // Todo: needs targeted safes list
  return !!safeAddress
}

export const useShowOutreachPopup = (isDismissed: boolean | undefined, askAgainLaterTimestamp: number | undefined) => {
  const cookiesPopup = useAppSelector(selectCookieBanner)
  const isSigner = useIsSafeOwner()
  const safeAddress = useSafeAddress()
  const isTargetedSafe = isTargetedSafeAddress(safeAddress)

  if (cookiesPopup?.open || isDismissed || !isSigner || !isTargetedSafe) return false

  if (askAgainLaterTimestamp) {
    return Date.now() - askAgainLaterTimestamp > MAX_ASK_AGAIN_DELAY
  }

  return true
}
