import { useGetSubmissionQuery } from '@/store/slices'
import { ACTIVE_OUTREACH } from '../constants'
import useChainId from '@/hooks/useChainId'
import useSafeAddress from '@/hooks/useSafeAddress'
import useWallet from '@/hooks/wallets/useWallet'
import { skipToken } from '@reduxjs/toolkit/query'

const useSubmission = () => {
  const currentChainId = useChainId()
  const safeAddress = useSafeAddress()
  const wallet = useWallet()

  const { data } = useGetSubmissionQuery(
    !wallet || !safeAddress
      ? skipToken
      : {
          outreachId: ACTIVE_OUTREACH.id,
          chainId: currentChainId,
          safeAddress,
          signerAddress: wallet?.address,
        },
  )

  return data
}

export default useSubmission
