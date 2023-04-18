import { Grid, DialogActions, Button, Box, Typography, DialogContent, SvgIcon } from '@mui/material'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { getSafeMessage, SafeMessageStatus } from '@safe-global/safe-gateway-typescript-sdk'
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
import useOnboard from '@/hooks/wallets/useOnboard'

import txStepperCss from '@/components/tx/TxStepper/styles.module.css'
import { DecodedMsg } from '../DecodedMsg'
import CopyButton from '@/components/common/CopyButton'
import { WrongChainWarning } from '@/components/tx/WrongChainWarning'
import CloseDialog from '@/components/safe-messages/MsgModal/CloseDialog'
import Confirmations from '@/components/safe-messages/MsgModal/Confirmations'
import { safeMsgDispatch, SafeMsgEvent } from '@/services/safe-messages/safeMsgEvents'

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

  const [closeDialogOpen, setCloseDialogOpen] = useState(false)

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

  const [isPolling, setIsPolling] = useState(false)

  // TODO: move to hook
  const [ongoingMessage, setOngoingMessage] = useState<Omit<SafeMessage, 'type'>>()
  const CONFIRMATIONS_POLLING_INTERVAL = 3000
  useEffect(() => {
    const fetchSafeMessage = async () => {
      try {
        const message = await getSafeMessage(safe.chainId, safeMessageHash)
        setOngoingMessage(message)

        if (message.confirmationsSubmitted === message.confirmationsRequired && message.preparedSignature) {
          setIsPolling(false)
          clearInterval(intervalId)
          safeMsgDispatch(SafeMsgEvent.SIGNATURE_PREPARED, {
            messageHash: safeMessageHash,
            requestId,
            signature: message.preparedSignature,
          })
          onClose()
        }
      } catch (e) {
        console.error(e)
      }
    }

    // Inititally load message
    if (!ongoingMessage) {
      fetchSafeMessage()
    }

    if (!isPolling) return

    // Start polling
    const intervalId = setInterval(() => {
      fetchSafeMessage()
    }, CONFIRMATIONS_POLLING_INTERVAL)

    return () => clearInterval(intervalId)
  }, [isPolling, onClose, ongoingMessage, requestId, safe.chainId, safeMessageHash])

  const hasSigned = !!ongoingMessage?.confirmations.some(({ owner }) => owner.value === wallet?.address)

  const isDisabled = !isOwner || hasSigned || !onboard

  const onSign = useCallback(async () => {
    // Error is shown when no wallet is connected, this appeases TypeScript
    if (!onboard) {
      return
    }

    setSubmitError(undefined)

    try {
      // If you are connected through WC
      if (requestId && !ongoingMessage) {
        await dispatchSafeMsgProposal({ onboard, safe, message: decodedMessage, requestId, safeAppId })
        setIsPolling(true)
      } else {
        await dispatchSafeMsgConfirmation({ onboard, safe, message: decodedMessage, requestId })
      }
    } catch (e) {
      setSubmitError(e as Error)
    }
  }, [decodedMessage, requestId, safe, safeAppId, onboard, ongoingMessage])

  const handleClose = () => {
    if (!ongoingMessage || ongoingMessage?.status === SafeMessageStatus.NEEDS_CONFIRMATION) {
      setCloseDialogOpen(true)
    }
  }

  return (
    <>
      <CloseDialog isOpen={closeDialogOpen} onClose={() => setCloseDialogOpen(false)} onConfirm={onClose} />
      <ModalDialog open onClose={handleClose} maxWidth="sm" fullWidth>
        <div className={txStepperCss.container}>
          <ModalDialogTitle onClose={handleClose}>
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
            <Confirmations message={ongoingMessage} threshold={safe.threshold} />
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
    </>
  )
}

export default MsgModal
