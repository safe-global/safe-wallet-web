import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import { ACTIVE_OUTREACH, MAX_ASK_AGAIN_DELAY } from '@/features/targetedOutreach/constants'
import { useAppSelector } from '@/store'
import { selectCookieBanner } from '@/store/popupSlice'
import type { getSubmission } from '@safe-global/safe-client-gateway-sdk'

const useShowOutreachPopup = (
  isDismissed: boolean | undefined,
  askAgainLaterTimestamp: number | undefined,
  submission: getSubmission | undefined,
) => {
  const cookiesPopup = useAppSelector(selectCookieBanner)
  const isSigner = useIsSafeOwner()

  const submissionHasLoaded = submission !== undefined
  const isTargetedSafe = submissionHasLoaded && (ACTIVE_OUTREACH.targetAll || !!submission?.outreachId)
  const hasCompletedSurvey = !!submission?.completionDate

  if (cookiesPopup?.open || isDismissed || !isSigner || !isTargetedSafe || hasCompletedSurvey) {
    return false
  }

  if (askAgainLaterTimestamp) {
    return Date.now() - askAgainLaterTimestamp > MAX_ASK_AGAIN_DELAY
  }

  return true
}

export default useShowOutreachPopup
