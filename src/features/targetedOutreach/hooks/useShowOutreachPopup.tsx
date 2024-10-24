import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import { MAX_ASK_AGAIN_DELAY } from '@/features/targetedOutreach/constants'
import { useAppSelector } from '@/store'
import { selectCookieBanner } from '@/store/popupSlice'
import type { getSubmission } from '@safe-global/safe-client-gateway-sdk'

export const useShowOutreachPopup = (
  isDismissed: boolean | undefined,
  askAgainLaterTimestamp: number | undefined,
  submission: Awaited<ReturnType<typeof getSubmission>> | undefined,
) => {
  const cookiesPopup = useAppSelector(selectCookieBanner)
  const isSigner = useIsSafeOwner()

  const isTargetedSafe = submission?.targetedSafeId && !submission.completionDate

  if (cookiesPopup?.open || isDismissed || !isSigner || !isTargetedSafe) {
    return false
  }

  if (askAgainLaterTimestamp) {
    return Date.now() - askAgainLaterTimestamp > MAX_ASK_AGAIN_DELAY
  }

  return true
}
