import { Grid, DialogActions, Button, Box, Typography, DialogContent, SvgIcon, Link, Stack } from '@mui/material'
import { useCallback, useMemo, useState } from 'react'
import { SafeMessageStatus } from '@safe-global/safe-gateway-typescript-sdk'
import type { ReactElement } from 'react'
import type { SafeMessage } from '@safe-global/safe-gateway-typescript-sdk'
import type { RequestId } from '@safe-global/safe-apps-sdk'

import ModalDialog, { ModalDialogTitle } from '@/components/common/ModalDialog'
import SafeAppIconCard from '@/components/safe-apps/SafeAppIconCard'
import EthHashInfo from '@/components/common/EthHashInfo'
import RequiredIcon from '@/public/images/messages/required.svg'
import {
  dispatchPreparedSignature,
  dispatchSafeMsgConfirmation,
  dispatchSafeMsgProposal,
} from '@/services/safe-messages/safeMsgSender'
import useSafeInfo from '@/hooks/useSafeInfo'
import { generateSafeMessageHash, generateSafeMessageMessage } from '@/utils/safe-messages'
import { getDecodedMessage } from '@/components/safe-apps/utils'
import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import ErrorMessage from '@/components/tx/ErrorMessage'
import useWallet from '@/hooks/wallets/useWallet'
import useSafeMessages from '@/hooks/useSafeMessages'
import useOnboard from '@/hooks/wallets/useOnboard'

import txStepperCss from '@/components/tx/TxStepper/styles.module.css'
import { DecodedMsg } from '../DecodedMsg'
import CopyButton from '@/components/common/CopyButton'
import { WrongChainWarning } from '@/components/tx/WrongChainWarning'
import MsgSigners from '@/components/safe-messages/MsgSigners'
import InfoIcon from '@/public/images/notifications/info.svg'
import { isSafeMessageListItem } from '@/utils/safe-message-guards'

const APP_LOGO_FALLBACK_IMAGE = '/images/apps/apps-icon.svg'
const APP_NAME_FALLBACK = 'Sign message off-chain'

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

  const onboard = useOnboard()
  const { safe } = useSafeInfo()
  const isOwner = useIsSafeOwner()
  const wallet = useWallet()
  const messages = useSafeMessages()

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

  const existingMessage = messages.page?.results
    ?.filter(isSafeMessageListItem)
    .find((msg) => msg.messageHash === safeMessageHash)

  const [ongoingMessage, setOngoingMessage] = useState<SafeMessage | undefined>(existingMessage)

  const hasSigned = !!ongoingMessage?.confirmations.some(({ owner }) => owner.value === wallet?.address)

  const isDisabled = !isOwner || hasSigned || !onboard

  const onSign = useCallback(async () => {
    // Error is shown when no wallet is connected, this appeases TypeScript
    if (!onboard) {
      return
    }

    setSubmitError(undefined)

    try {
      // When collecting the first signature
      if (requestId && !ongoingMessage) {
        await dispatchSafeMsgProposal({ onboard, safe, message: decodedMessage, requestId, safeAppId })
        const message = await dispatchPreparedSignature(safe.chainId, safeMessageHash, onClose, requestId)
        setOngoingMessage(message)
      } else {
        await dispatchSafeMsgConfirmation({ onboard, safe, message: decodedMessage, requestId })
        dispatchPreparedSignature(safe.chainId, safeMessageHash, onClose, requestId)
      }
    } catch (e) {
      setSubmitError(e as Error)
    }
  }, [onboard, requestId, ongoingMessage, safe, decodedMessage, safeAppId, safeMessageHash, onClose])

  const handleClose = useCallback(() => {
    if (!ongoingMessage || ongoingMessage?.status === SafeMessageStatus.NEEDS_CONFIRMATION) {
      setShowCloseTooltip(true)
    } else {
      onClose()
    }
  }, [onClose, ongoingMessage])

  const closeTooltipTitle = useMemo(
    () => (
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', padding: '8px' }}>
        <SvgIcon component={InfoIcon} inheritViewBox fontSize="small" />
        <Typography>The signature is incomplete. If you submit the form now, it will be discarded.</Typography>
        <Link onClick={onClose} component="button" variant="body1" sx={{ textDecoration: 'none' }}>
          Discard signature
        </Link>
      </Stack>
    ),
    [onClose],
  )

  return (
    <ModalDialog open onClose={handleClose} maxWidth="sm" fullWidth>
      <div className={txStepperCss.container}>
        <ModalDialogTitle onClose={handleClose} closeButtonTooltip={showCloseTooltip ? closeTooltipTitle : undefined}>
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
            This action will confirm the message and add your confirmation to the prepared signature.
          </Typography>
          <Typography fontWeight={700} mb={1}>
            Message:{' '}
            <CopyButton
              text={typeof decodedMessage === 'string' ? decodedMessage : JSON.stringify(decodedMessage, null, 2)}
            />
          </Typography>
          <DecodedMsg message={decodedMessage} isInModal />
          {ongoingMessage && <MsgSigners msg={ongoingMessage} hideInitialItem />}
          <Typography fontWeight={700} mt={2}>
            SafeMessage:
          </Typography>
          <Typography variant="body2">
            <EthHashInfo address={safeMessageMessage} showAvatar={false} shortAddress={false} showCopyButton />
          </Typography>

          <Typography fontWeight={700} mt={2}>
            SafeMessage hash:
          </Typography>
          <Typography variant="body2">
            <EthHashInfo address={safeMessageHash} showAvatar={false} shortAddress={false} showCopyButton />
          </Typography>

          {/* Warning message and switch button */}
          <WrongChainWarning />

          {!wallet || !onboard ? (
            <ErrorMessage>No wallet is connected.</ErrorMessage>
          ) : !isOwner ? (
            <ErrorMessage>
              You are currently not an owner of this Safe and won&apos;t be able to confirm this message.
            </ErrorMessage>
          ) : hasSigned ? (
            <ErrorMessage>Your connected wallet has already signed this message.</ErrorMessage>
          ) : submitError ? (
            <ErrorMessage error={submitError}>Error confirming the message. Please try again.</ErrorMessage>
          ) : null}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button color="inherit" onClick={onSign} disabled={isDisabled}>
            Sign
          </Button>
        </DialogActions>
      </div>
    </ModalDialog>
  )
}

export default MsgModal
