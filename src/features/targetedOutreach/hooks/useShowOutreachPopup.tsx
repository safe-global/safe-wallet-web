import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import useSafeAddress from '@/hooks/useSafeAddress'
import type { OutreachPopupState } from '@/features/targetedOutreach/components/OutreachPopup'
import { MAX_ASK_AGAIN_DELAY, MIN_ASK_AGAIN_DELAY } from '@/features/targetedOutreach/constants'
import { useAppSelector } from '@/store'
import { selectCookieBanner } from '@/store/popupSlice'

const isTargetedSafeAddress = (safeAddress: string): boolean => {
  // Todo: needs targeted safes list
  return !!safeAddress
}

export const useShowOutreachPopup = (outreachPopupState: OutreachPopupState | undefined) => {
  const cookiesPopup = useAppSelector(selectCookieBanner)
  const isSigner = useIsSafeOwner()
  const safeAddress = useSafeAddress()
  const isTargetedSafe = isTargetedSafeAddress(safeAddress)

  const firstDismissed = outreachPopupState?.activityTimestamps && outreachPopupState?.activityTimestamps[0]
  const currentTime = Date.now()
  const isFrequentUser = !!outreachPopupState?.activityTimestamps && outreachPopupState.activityTimestamps.length >= 5

  if (cookiesPopup?.open || outreachPopupState?.isClosed || !isSigner || !isTargetedSafe) return false

  // "Ask again later" logic
  if (outreachPopupState?.askAgainLater && firstDismissed) {
    const timeSinceFirstDismissed = currentTime - firstDismissed
    if (timeSinceFirstDismissed < MIN_ASK_AGAIN_DELAY) {
      return false
    }
    if (timeSinceFirstDismissed > MAX_ASK_AGAIN_DELAY) {
      return true
    }
    return isFrequentUser
  }

  return true
}
