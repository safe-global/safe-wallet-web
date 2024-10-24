import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import useSafeAddress from '@/hooks/useSafeAddress'
import { ACTIVE_OUTREACH, MAX_ASK_AGAIN_DELAY } from '@/features/targetedOutreach/constants'
import { useAppSelector } from '@/store'
import { selectCookieBanner } from '@/store/popupSlice'
import { getSubmission } from '@safe-global/safe-client-gateway-sdk'
import useChainId from '@/hooks/useChainId'
import useWallet from '@/hooks/wallets/useWallet'
import useAsync from '@/hooks/useAsync'

export const useShowOutreachPopup = (isDismissed: boolean | undefined, askAgainLaterTimestamp: number | undefined) => {
  const cookiesPopup = useAppSelector(selectCookieBanner)
  const isSigner = useIsSafeOwner()
  const safeAddress = useSafeAddress()
  const currentChainId = useChainId()
  const wallet = useWallet()

  const [submission] = useAsync(() => {
    if (wallet) {
      return getSubmission({
        params: {
          path: { outreachId: ACTIVE_OUTREACH.id, chainId: currentChainId, safeAddress, signerAddress: wallet.address },
        },
      })
    }
  }, [currentChainId, safeAddress, wallet])

  const isTargetedSafe = submission?.targetedSafeId && !submission.completionDate

  if (cookiesPopup?.open || isDismissed || !isSigner || !isTargetedSafe) {
    return false
  }

  if (askAgainLaterTimestamp) {
    return Date.now() - askAgainLaterTimestamp > MAX_ASK_AGAIN_DELAY
  }

  return true
}
