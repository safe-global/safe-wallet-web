import { Grid, Button, Box, Typography, SvgIcon, CardContent, CardActions } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useContext } from 'react'
import { SafeMessageListItemType, SafeMessageStatus } from '@safe-global/safe-gateway-typescript-sdk'
import type { ReactElement } from 'react'
import type { SafeMessage } from '@safe-global/safe-gateway-typescript-sdk'
import type { RequestId } from '@safe-global/safe-apps-sdk'
import EthHashInfo from '@/components/common/EthHashInfo'
import RequiredIcon from '@/public/images/messages/required.svg'
import useSafeInfo from '@/hooks/useSafeInfo'

import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import ErrorMessage from '@/components/tx/ErrorMessage'
import useWallet from '@/hooks/wallets/useWallet'
import { useSafeMessage } from '@/hooks/messages/useSafeMessages'
import useOnboard, { switchWallet } from '@/hooks/wallets/useOnboard'
import { TxModalContext } from '@/components/tx-flow'
import CopyButton from '@/components/common/CopyButton'
import { WrongChainWarning } from '@/components/tx/WrongChainWarning'
import MsgSigners from '@/components/safe-messages/MsgSigners'
import useDecodedSafeMessage from '@/hooks/messages/useDecodedSafeMessage'
import useSyncSafeMessageSigner from '@/hooks/messages/useSyncSafeMessageSigner'
import SuccessMessage from '@/components/tx/SuccessMessage'
import useHighlightHiddenTab from '@/hooks/useHighlightHiddenTab'
import InfoBox from '@/components/safe-messages/InfoBox'
import { DecodedMsg } from '@/components/safe-messages/DecodedMsg'
import TxCard from '@/components/tx-flow/common/TxCard'

const createSkeletonMessage = (confirmationsRequired: number): SafeMessage => {
  return {
    confirmations: [],
    confirmationsRequired,
    confirmationsSubmitted: 0,
    creationTimestamp: 0,
    message: '',
    logoUri: null,
    messageHash: '',
    modifiedTimestamp: 0,
    name: null,
    proposedBy: {
      value: '',
    },
    status: SafeMessageStatus.NEEDS_CONFIRMATION,
    type: SafeMessageListItemType.MESSAGE,
  }
}

const MessageHashField = ({ label, hashValue }: { label: string; hashValue: string }) => (
  <>
    <Typography variant="body2" fontWeight={700} mt={2}>
      {label}:
    </Typography>
    <Typography variant="body2">
      <EthHashInfo address={hashValue} showAvatar={false} shortAddress={false} showCopyButton />
    </Typography>
  </>
)

const DialogHeader = ({ threshold }: { threshold: number }) => (
  <>
    <Box textAlign="center" mb={2}>
      <SvgIcon component={RequiredIcon} viewBox="0 0 32 32" fontSize="large" />
    </Box>
    <Typography variant="h4" textAlign="center" gutterBottom>
      Confirm message
    </Typography>
    <Typography variant="body1" textAlign="center" mb={2}>
      To sign this message, you need to collect <b>{threshold} owner signatures</b> of your Safe Account.
    </Typography>
  </>
)

const MessageDialogError = ({ isOwner, submitError }: { isOwner: boolean; submitError: Error | undefined }) => {
  const wallet = useWallet()
  const onboard = useOnboard()

  const errorMessage =
    !wallet || !onboard
      ? 'No wallet is connected.'
      : !isOwner
      ? "You are currently not an owner of this Safe Account and won't be able to confirm this message."
      : submitError
      ? 'Error confirming the message. Please try again.'
      : null

  if (errorMessage) {
    return <ErrorMessage>{errorMessage}</ErrorMessage>
  }
  return null
}

const AlreadySignedByOwnerMessage = ({ hasSigned }: { hasSigned: boolean }) => {
  const onboard = useOnboard()

  const handleSwitchWallet = () => {
    if (onboard) {
      switchWallet(onboard)
    }
  }
  if (!hasSigned) {
    return null
  }
  return (
    <SuccessMessage>
      <Grid container direction="row" justifyContent="space-between">
        <Grid item xs={7}>
          Your connected wallet has already signed this message.
        </Grid>
        <Grid item xs={4}>
          <Button variant="contained" size="small" onClick={handleSwitchWallet} fullWidth>
            Switch wallet
          </Button>
        </Grid>
      </Grid>
    </SuccessMessage>
  )
}

type BaseProps = Pick<SafeMessage, 'logoUri' | 'name' | 'message'>

// Custom Safe Apps do not have a `safeAppId`
export type ProposeProps = BaseProps & {
  safeAppId?: number
  requestId: RequestId
}

// A proposed message does not return the `safeAppId` but the `logoUri` and `name` of the Safe App that proposed it
export type ConfirmProps = BaseProps & {
  safeAppId?: never
  requestId?: RequestId
}

const SignMessage = ({ message, safeAppId, requestId }: ProposeProps | ConfirmProps): ReactElement => {
  // Hooks & variables
  const { setTxFlow } = useContext(TxModalContext)
  const { palette } = useTheme()
  const { safe } = useSafeInfo()
  const isOwner = useIsSafeOwner()
  const wallet = useWallet()

  const { decodedMessage, safeMessageMessage, safeMessageHash } = useDecodedSafeMessage(message, safe)
  const ongoingMessage = useSafeMessage(safeMessageHash)
  useHighlightHiddenTab()

  const decodedMessageAsString =
    typeof decodedMessage === 'string' ? decodedMessage : JSON.stringify(decodedMessage, null, 2)

  const hasSigned = !!ongoingMessage?.confirmations.some(({ owner }) => owner.value === wallet?.address)

  const isDisabled = !isOwner || hasSigned

  const { onSign, submitError } = useSyncSafeMessageSigner(
    ongoingMessage,
    decodedMessage,
    safeMessageHash,
    requestId,
    safeAppId,
    () => setTxFlow(undefined),
  )

  return (
    <>
      <TxCard>
        <CardContent>
          <DialogHeader threshold={safe.threshold} />

          <Typography fontWeight={700} mb={1}>
            Message: <CopyButton text={decodedMessageAsString} />
          </Typography>
          <DecodedMsg message={decodedMessage} isInModal />

          <MessageHashField label="SafeMessage" hashValue={safeMessageMessage} />
          <MessageHashField label="SafeMessage hash" hashValue={safeMessageHash} />
        </CardContent>
      </TxCard>

      <TxCard>
        <AlreadySignedByOwnerMessage hasSigned={hasSigned} />

        <InfoBox
          title="Collect all the confirmations"
          message={
            requestId
              ? 'Please keep this modal open until all signers confirm this message. Closing the modal will abort the signing request.'
              : 'The signature will be submitted to the Safe App when the message is fully signed.'
          }
        >
          <MsgSigners
            msg={ongoingMessage || createSkeletonMessage(safe.threshold)}
            showOnlyConfirmations
            showMissingSignatures
            backgroundColor={palette.info.background}
          />
        </InfoBox>

        <WrongChainWarning />

        <MessageDialogError isOwner={isOwner} submitError={submitError} />
      </TxCard>

      <TxCard>
        <CardActions>
          <Button variant="contained" color="primary" onClick={onSign} disabled={isDisabled}>
            Sign
          </Button>
        </CardActions>
      </TxCard>
    </>
  )
}

export default SignMessage
