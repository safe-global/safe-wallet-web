import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import useSafeAddress from '@/hooks/useSafeAddress'
import type { OutreachPopupState } from '../components/OutreachPopup'

const TARGETED_SAFE_ADDRESSES = ['0x5Cd167cd2D246B19834726904FA3247362182f6F']

const isTargetedSafeAddress = (safeAddress: string): boolean => {
  return TARGETED_SAFE_ADDRESSES.includes(safeAddress)
}

const DAY_IN_MS = 24 * 60 * 60 * 1000
export const MIN_ASK_AGAIN_DELAY = DAY_IN_MS * 2
export const MAX_ASK_AGAIN_DELAY = DAY_IN_MS * 7

export const useShowOutreachPopup = (outreachPopupState: OutreachPopupState | undefined) => {
  const isSigner = useIsSafeOwner()
  const safeAddress = useSafeAddress()
  const isTargetedSafe = isTargetedSafeAddress(safeAddress)

  const firstDismissed = outreachPopupState?.activityTimestamps && outreachPopupState?.activityTimestamps[0]
  const currentTime = Date.now()
  const isFrequentUser = outreachPopupState?.activityTimestamps && outreachPopupState.activityTimestamps.length >= 5

  if (outreachPopupState?.isClosed) return false

  // Check if both isSigner and isTargetedSafe are true
  if (!isSigner || !isTargetedSafe) return false

  // Handle "ask again later" logic
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
