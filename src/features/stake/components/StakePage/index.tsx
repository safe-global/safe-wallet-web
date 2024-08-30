import { Stack } from '@mui/material'
import Disclaimer from '@/components/common/Disclaimer'
import LegalDisclaimerContent from '@/features/stake/components/LegalDisclaimer'
import useStakeConsent from '@/features/stake/useStakeConsent'
import StakingWidget from '../StakingWidget'

const StakePage = () => {
  const { isConsentAccepted, onAccept } = useStakeConsent()

  return (
    <>
      {isConsentAccepted === undefined ? null : isConsentAccepted ? (
        <StakingWidget />
      ) : (
        <Stack direction="column" alignItems="center" justifyContent="center" flex={1}>
          <Disclaimer title="Note" content={<LegalDisclaimerContent />} onAccept={onAccept} buttonText="Continue" />
        </Stack>
      )}
    </>
  )
}

export default StakePage
