import { Grid, DialogActions, Button, Box, Typography, DialogContent, SvgIcon } from '@mui/material'
import { useMemo } from 'react'
import { getSafeMessage } from '@gnosis.pm/safe-react-gateway-sdk'
import type { ReactElement } from 'react'
import type { SafeMessage } from '@gnosis.pm/safe-react-gateway-sdk'
import type { RequestId } from '@gnosis.pm/safe-apps-sdk'

import ModalDialog, { ModalDialogTitle } from '@/components/common/ModalDialog'
import SafeAppIcon from '@/components/safe-apps/SafeAppIcon'
import Msg from '@/components/safeMessages/Msg'
import EthHashInfo from '@/components/common/EthHashInfo'
import RequiredIcon from '@/public/images/messages/required.svg'
import { dispatchSafeMsgConfirmation, dispatchSafeMsgProposal } from '@/services/safe-messages/safeMsgSender'
import useSafeInfo from '@/hooks/useSafeInfo'
import { generateSafeMessageHash } from '@/utils/safe-messages'

import txStepperCss from '@/components/tx/TxStepper/styles.module.css'

const APP_LOGO_FALLBACK_IMAGE = '/images/apps/apps-icon.svg'

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

export const _isSafeMessageProposal = async (
  chainId: string,
  messageHash: SafeMessage['messageHash'],
): Promise<boolean> => {
  try {
    await getSafeMessage(chainId, messageHash)
    return false
  } catch {
    return true
  }
}

const MsgModal = ({
  onClose,
  logoUri = APP_LOGO_FALLBACK_IMAGE,
  name,
  message,
  messageHash,
  safeAppId,
  requestId,
}: ProposeProps | ConfirmProps): ReactElement => {
  const { safe } = useSafeInfo()

  const hash = useMemo(() => {
    return messageHash ?? generateSafeMessageHash(safe, message)
  }, [messageHash, safe, message])

  const onSign = async () => {
    const shouldPropose = await _isSafeMessageProposal(safe.chainId, hash)

    if (requestId && shouldPropose) {
      await dispatchSafeMsgProposal(safe, message, requestId, safeAppId)
    } else {
      await dispatchSafeMsgConfirmation(safe, message, requestId)
    }

    onClose()
  }

  return (
    <ModalDialog open onClose={onClose} maxWidth="sm" fullWidth>
      <div className={txStepperCss.container}>
        <ModalDialogTitle onClose={onClose}>
          <Grid container px={1} alignItems="center" gap={2}>
            <Grid item>
              <Box display="flex" alignItems="center">
                <SafeAppIcon
                  src={logoUri || APP_LOGO_FALLBACK_IMAGE}
                  alt={name || 'An icon of an application'}
                  width={24}
                  height={24}
                />
                <Typography variant="h4">{name}</Typography>
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
          <Typography fontWeight={700}>Message:</Typography>
          <Msg message={message} />
          <Typography fontWeight={700} mt={2}>
            Hash:
          </Typography>
          <EthHashInfo address={hash} showAvatar={false} shortAddress={false} showCopyButton />
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button color="inherit" onClick={onSign}>
            Sign
          </Button>
        </DialogActions>
      </div>
    </ModalDialog>
  )
}

export default MsgModal
