import {
  Grid,
  DialogActions,
  Button,
  Box,
  Typography,
  DialogContent,
  SvgIcon,
  Link,
  Stack,
  Dialog,
  DialogTitle,
  DialogContentText,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { SafeMessageListItemType, SafeMessageStatus } from '@safe-global/safe-gateway-typescript-sdk'
import type { ReactElement } from 'react'
import type { SafeMessage } from '@safe-global/safe-gateway-typescript-sdk'
import type { RequestId } from '@safe-global/safe-apps-sdk'

import ModalDialog, { ModalDialogTitle } from '@/components/common/ModalDialog'
import SafeAppIconCard from '@/components/safe-apps/SafeAppIconCard'
import EthHashInfo from '@/components/common/EthHashInfo'
import RequiredIcon from '@/public/images/messages/required.svg'
import { dispatchSafeMsgConfirmation, dispatchSafeMsgProposal } from '@/services/safe-messages/safeMsgSender'
import useSafeInfo from '@/hooks/useSafeInfo'
import { generateSafeMessageHash, generateSafeMessageMessage } from '@/utils/safe-messages'
import { getDecodedMessage } from '@/components/safe-apps/utils'
import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import ErrorMessage from '@/components/tx/ErrorMessage'
import useWallet from '@/hooks/wallets/useWallet'
import useSafeMessages from '@/hooks/useSafeMessages'
import useOnboard, { switchWallet } from '@/hooks/wallets/useOnboard'

import txStepperCss from '@/components/tx/TxStepper/styles.module.css'
import { DecodedMsg } from '../DecodedMsg'
import CopyButton from '@/components/common/CopyButton'
import { WrongChainWarning } from '@/components/tx/WrongChainWarning'
import MsgSigners from '@/components/safe-messages/MsgSigners'
import InfoIcon from '@/public/images/notifications/info.svg'
import { isSafeMessageListItem } from '@/utils/safe-message-guards'
import { dispatchPreparedSignature } from '@/services/safe-messages/safeMsgNotifications'
import SuccessMessage from '@/components/tx/SuccessMessage'
import InfoBox from '../InfoBox'

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

type BaseProps = {
  onClose: () => void
} & Pick<SafeMessage, 'logoUri' | 'name' | 'message'>

// Custom Safe Apps do not have a `safeAppId`
type ProposeProps = BaseProps & {
  safeAppId?: number
  messageHash?: never
  requestId: RequestId
}

// A proposed message does not return the `safeAppId` but the `logoUri` and `name` of the Safe App that proposed it
type ConfirmProps = BaseProps & {
  safeAppId?: never
  messageHash: string
  requestId?: RequestId
}

const MsgModal = ({
  onClose,
  logoUri,
  name,
  message,
  messageHash,
  safeAppId,
  requestId,
}: ProposeProps | ConfirmProps): ReactElement => {
  // Hooks & variables
  const [submitError, setSubmitError] = useState<Error | undefined>()
  const [showCloseTooltip, setShowCloseTooltip] = useState<boolean>(false)
  const { palette } = useTheme()

  const onboard = useOnboard()
  const { safe } = useSafeInfo()
  const isOwner = useIsSafeOwner()
  const wallet = useWallet()
  const messages = useSafeMessages()

  const handleSwitchWallet = () => {
    if (onboard) {
      switchWallet(onboard)
    }
  }

  // Decode message if UTF-8 encoded
  const decodedMessage = useMemo(() => {
    return typeof message === 'string' ? getDecodedMessage(message) : message
  }, [message])

  // Get `SafeMessage` message
  const safeMessageMessage = useMemo(() => {
    return generateSafeMessageMessage(decodedMessage)
  }, [decodedMessage])

  // Get `SafeMessage` hash
  const safeMessageHash = useMemo(() => {
    return messageHash ?? generateSafeMessageHash(safe, decodedMessage)
  }, [messageHash, safe, decodedMessage])

  const ongoingMessage = messages.page?.results
    ?.filter(isSafeMessageListItem)
    .find((msg) => msg.messageHash === safeMessageHash)

  const hasSigned = !!ongoingMessage?.confirmations.some(({ owner }) => owner.value === wallet?.address)

  const isDisabled = !isOwner || hasSigned || !onboard

  // If the message gets updated in the messageSlice we dispatch it if the signature is prepared
  useEffect(() => {
    if (ongoingMessage?.preparedSignature) {
      dispatchPreparedSignature(safe.chainId, safeMessageHash, onClose, requestId)
    }
  }, [ongoingMessage, safe.chainId, safeMessageHash, onClose, requestId])

  const onSign = useCallback(async () => {
    // Error is shown when no wallet is connected, this appeases TypeScript
    if (!onboard) {
      return
    }

    setSubmitError(undefined)

    try {
      // When collecting the first signature
      if (!ongoingMessage) {
        await dispatchSafeMsgProposal({ onboard, safe, message: decodedMessage, safeAppId })

        // If threshold 1, we do not want to wait for polling
        if (safe.threshold === 1) {
          await dispatchPreparedSignature(safe.chainId, safeMessageHash, onClose, requestId)
        }
      } else {
        await dispatchSafeMsgConfirmation({ onboard, safe, message: decodedMessage })

        // No requestID => we are in the confirm message dialog and do not need to leave the window open
        if (!requestId) {
          onClose()
          return
        }

        // If the last signature was added to the message, we can immediately dispatch the signature
        if (ongoingMessage.confirmationsRequired <= ongoingMessage.confirmationsSubmitted + 1) {
          dispatchPreparedSignature(safe.chainId, safeMessageHash, onClose, requestId)
        }
      }
    } catch (e) {
      setSubmitError(e as Error)
    }
  }, [onboard, requestId, ongoingMessage, safe, decodedMessage, safeAppId, safeMessageHash, onClose])

  const handleClose = useCallback(() => {
    if (requestId && (!ongoingMessage || ongoingMessage.status === SafeMessageStatus.NEEDS_CONFIRMATION)) {
      // If we are in a Safe app modal we want to keep the modal open
      setShowCloseTooltip(true)
    } else {
      onClose()
    }
  }, [onClose, ongoingMessage, requestId])

  const closeTooltipTitle = useMemo(
    () => (
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', padding: '8px' }}>
        <SvgIcon component={InfoIcon} inheritViewBox fontSize="small" />
        <Link onClick={onClose} component="button" variant="body1" sx={{ textDecoration: 'none' }}>
          Abort
        </Link>
      </Stack>
    ),
    [onClose],
  )

  return (
    <>
      <ModalDialog open onClose={handleClose} maxWidth="sm" fullWidth>
        <div className={txStepperCss.container}>
          <ModalDialogTitle
            onClose={requestId ? undefined : handleClose}
            closeButtonTooltip={showCloseTooltip ? closeTooltipTitle : undefined}
          >
            <Grid container px={1} alignItems="center" gap={2}>
              <Grid item>
                <Box display="flex" alignItems="center">
                  <SafeAppIconCard
                    src={logoUri || APP_LOGO_FALLBACK_IMAGE}
                    alt={name || 'An icon of an application'}
                    width={24}
                    height={24}
                  />
                  <Typography variant="h4" pl={1}>
                    {name || APP_NAME_FALLBACK}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </ModalDialogTitle>

          <DialogContent>
            <Box textAlign="center" mt={4} mb={2}>
              <SvgIcon component={RequiredIcon} viewBox="0 0 32 32" fontSize="large" />
            </Box>
            <Typography variant="h4" textAlign="center" gutterBottom>
              Confirm message
            </Typography>
            <Typography variant="body1" textAlign="center" mb={2}>
              To sign this message, collect <b>{safe.threshold} signatures</b> from your Safe Account.
            </Typography>
            <Typography fontWeight={700} mb={1}>
              Message:{' '}
              <CopyButton
                text={typeof decodedMessage === 'string' ? decodedMessage : JSON.stringify(decodedMessage, null, 2)}
              />
            </Typography>
            <DecodedMsg message={decodedMessage} isInModal />
            <Typography variant="body2" fontWeight={700} mt={2}>
              SafeMessage:
            </Typography>
            <Typography variant="body2">
              <EthHashInfo address={safeMessageMessage} showAvatar={false} shortAddress={false} showCopyButton />
            </Typography>

            <Typography variant="body2" fontWeight={700} mt={2}>
              SafeMessage hash:
            </Typography>
            <Typography variant="body2">
              <EthHashInfo address={safeMessageHash} showAvatar={false} shortAddress={false} showCopyButton />
            </Typography>

            {hasSigned && (
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
            )}

            <InfoBox
              message={
                requestId
                  ? 'Please keep this modal open until all signers will confirm the message. Closing this modal will abort the signing request.'
                  : 'The first signer will submit the siganture to the Safe App when the message is fully signed'
              }
            >
              <MsgSigners
                msg={ongoingMessage || createSkeletonMessage(safe.threshold)}
                showOnlyConfirmations
                showMissingSignatures
                backgroundColor={palette.info.background}
              />
            </InfoBox>

            {/* Warning message and switch button */}
            <WrongChainWarning />

            {!wallet || !onboard ? (
              <ErrorMessage>No wallet is connected.</ErrorMessage>
            ) : !isOwner ? (
              <ErrorMessage>
                You are currently not an owner of this Safe Account and won&apos;t be able to confirm this message.
              </ErrorMessage>
            ) : submitError ? (
              <ErrorMessage error={submitError}>Error confirming the message. Please try again.</ErrorMessage>
            ) : null}
          </DialogContent>

          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button variant="contained" color="inherit" onClick={onSign} disabled={isDisabled}>
              Sign
            </Button>
          </DialogActions>
        </div>
      </ModalDialog>
      {/* Confirmation Dialog */}
      <Dialog
        open={showCloseTooltip}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Cancel sign message request</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <Typography variant="body2">If you close the modal now, the signature request will be aborted.</Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCloseTooltip(false)}>Cancel</Button>
          <Button variant="contained" onClick={onClose} autoFocus>
            Abort signing
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default MsgModal
