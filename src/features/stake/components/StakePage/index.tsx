import { Stack } from '@mui/material'
import Disclaimer from '@/components/common/Disclaimer'
import WidgetDisclaimer from '@/components/common/WidgetDisclaimer'
import useStakeConsent from '@/features/stake/useStakeConsent'
import StakingWidget from '../StakingWidget'
import { useRouter } from 'next/router'
import { useGetIsSanctionedQuery } from '@/store/ofac'
import { skipToken } from '@reduxjs/toolkit/query/react'
import useWallet from '@/hooks/wallets/useWallet'
import useSafeInfo from '@/hooks/useSafeInfo'
import { getKeyWithTrueValue } from '@/utils/helpers'
import BlockedAddress from '@/components/common/BlockedAddress'

const StakePage = () => {
  const { isConsentAccepted, onAccept } = useStakeConsent()
  const router = useRouter()
  const { asset } = router.query

  const { safeAddress } = useSafeInfo()
  const wallet = useWallet()

  const { data: isSafeAddressBlocked } = useGetIsSanctionedQuery(safeAddress || skipToken)
  const { data: isWalletAddressBlocked } = useGetIsSanctionedQuery(wallet?.address || skipToken)
  const blockedAddresses = {
    [safeAddress]: !!isSafeAddressBlocked,
    [wallet?.address || '']: !!isWalletAddressBlocked,
  }

  const blockedAddress = getKeyWithTrueValue(blockedAddresses)

  if (blockedAddress) {
    return (
      <Stack direction="column" alignItems="center" justifyContent="center" flex={1}>
        <BlockedAddress address={blockedAddress} featureTitle="stake feature with Kiln" />
      </Stack>
    )
  }

  return (
    <>
      {isConsentAccepted === undefined ? null : isConsentAccepted ? (
        <StakingWidget asset={String(asset)} />
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
