import { Grid, DialogActions, Button, Box, Typography, DialogContent, SvgIcon } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useCallback, useState } from 'react'
import { SafeMessageListItemType, SafeMessageStatus } from '@safe-global/safe-gateway-typescript-sdk'
import type { ReactElement } from 'react'
import type { SafeMessage } from '@safe-global/safe-gateway-typescript-sdk'
import type { RequestId } from '@safe-global/safe-apps-sdk'

import ModalDialog, { ModalDialogTitle } from '@/components/common/ModalDialog'
import SafeAppIconCard from '@/components/safe-apps/SafeAppIconCard'
import EthHashInfo from '@/components/common/EthHashInfo'
import RequiredIcon from '@/public/images/messages/required.svg'
import useSafeInfo from '@/hooks/useSafeInfo'

import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import ErrorMessage from '@/components/tx/ErrorMessage'
import useWallet from '@/hooks/wallets/useWallet'
import { useSafeMessage } from '@/hooks/messages/useSafeMessages'
import useOnboard, { switchWallet } from '@/hooks/wallets/useOnboard'

import txStepperCss from '@/components/tx/TxStepper/styles.module.css'
import { DecodedMsg } from '../DecodedMsg'
import CopyButton from '@/components/common/CopyButton'
import { WrongChainWarning } from '@/components/tx/WrongChainWarning'
import MsgSigners from '@/components/safe-messages/MsgSigners'
import { ConfirmationDialog } from './ConfirmationDialog'
import useDecodedSafeMessage from '@/hooks/messages/useDecodedSafeMessage'
import useSyncSafeMessageSigner from '@/hooks/messages/useSyncSafeMessageSigner'
import SuccessMessage from '@/components/tx/SuccessMessage'
import InfoBox from '../InfoBox'
import useHighlightHiddenTab from '@/hooks/useHighlightHiddenTab'

const APP_LOGO_FALLBACK_IMAGE = '/images/apps/apps-icon.svg'
const APP_NAME_FALLBACK = 'Sign message off-chain'

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
    <Box textAlign="center" mt={4} mb={2}>
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

const DialogTitle = ({
  onClose,
  name,
  logoUri,
}: {
  onClose: () => void
  name: string | null
  logoUri: string | null
}) => {
  const appName = name || APP_NAME_FALLBACK
  const appLogo = logoUri || APP_LOGO_FALLBACK_IMAGE
  return (
    <ModalDialogTitle onClose={onClose}>
      <Grid container px={1} alignItems="center" gap={2}>
        <Grid item>
          <Box display="flex" alignItems="center">
            <SafeAppIconCard src={appLogo} alt={name || 'The icon of the application'} width={24} height={24} />
            <Typography variant="h4" pl={1}>
              {appName}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </ModalDialogTitle>
  )
}

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
      <Grid container direction="row">
        <Grid item xs>
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

type BaseProps = {
  onClose: () => void
} & Pick<SafeMessage, 'logoUri' | 'name' | 'message'>

// Custom Safe Apps do not have a `safeAppId`
type ProposeProps = BaseProps & {
  safeAppId?: number
  requestId: RequestId
}

// A proposed message does not return the `safeAppId` but the `logoUri` and `name` of the Safe App that proposed it
type ConfirmProps = BaseProps & {
  safeAppId?: never
  requestId?: RequestId
}

const MsgModal = ({
  onClose,
  logoUri,
  name,
  message,
  safeAppId,
  requestId,
}: ProposeProps | ConfirmProps): ReactElement => {
  // Hooks & variables
  const [showCloseTooltip, setShowCloseTooltip] = useState<boolean>(false)
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
    onClose,
  )

  const handleClose = useCallback(() => {
    if (requestId && (!ongoingMessage || ongoingMessage.status === SafeMessageStatus.NEEDS_CONFIRMATION)) {
      // If we are in a Safe app modal we want to keep the modal open
      setShowCloseTooltip(true)
    } else {
      onClose()
    }
  }, [onClose, ongoingMessage, requestId])

  return (
    <>
      <ModalDialog open maxWidth="sm" fullWidth>
        <div className={txStepperCss.container}>
          <DialogTitle onClose={handleClose} logoUri={logoUri} name={name} />

          <DialogContent>
            <DialogHeader threshold={safe.threshold} />

            <Typography fontWeight={700} mb={1}>
              Message: <CopyButton text={decodedMessageAsString} />
            </Typography>
            <DecodedMsg message={decodedMessage} isInModal />

            <MessageHashField label="SafeMessage" hashValue={safeMessageMessage} />
            <MessageHashField label="SafeMessage hash" hashValue={safeMessageHash} />

            <AlreadySignedByOwnerMessage hasSigned={hasSigned} />

            <InfoBox
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
          </DialogContent>

          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button variant="contained" color="primary" onClick={onSign} disabled={isDisabled}>
              Sign
            </Button>
          </DialogActions>
        </div>
      </ModalDialog>
      <ConfirmationDialog open={showCloseTooltip} onCancel={() => setShowCloseTooltip(false)} onClose={onClose} />
    </>
  )
}

export default MsgModal
