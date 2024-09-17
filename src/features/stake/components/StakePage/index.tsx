import { Stack } from '@mui/material'
import Disclaimer from '@/components/common/Disclaimer'
import WidgetDisclaimer from '@/components/common/WidgetDisclaimer'
import useStakeConsent from '@/features/stake/useStakeConsent'
import StakingWidget from '../StakingWidget'
import { useRouter } from 'next/router'

const StakePage = () => {
  const { isConsentAccepted, onAccept } = useStakeConsent()
  const router = useRouter()
  const { asset } = router.query

  return (
    <>
      {isConsentAccepted === undefined ? null : isConsentAccepted ? (
        <StakingWidget asset={String(asset ? asset : '')} />
      ) : (
        <Stack direction="column" alignItems="center" justifyContent="center" flex={1}>
          <Disclaimer
            title="Note"
            content={<WidgetDisclaimer widgetName="Stake Widget by Kiln" />}
            onAccept={onAccept}
            buttonText="Continue"
          />
        </Stack>
      )}
    </>
  )
}

export default StakePage
