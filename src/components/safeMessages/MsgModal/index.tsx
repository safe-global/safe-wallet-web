import { Grid, DialogActions, Button, Box, Typography, DialogContent, SvgIcon } from '@mui/material'
import type { ReactElement } from 'react'
import type { SafeMessage } from '@safe-global/safe-gateway-typescript-sdk'

import ModalDialog, { ModalDialogTitle } from '@/components/common/ModalDialog'
import SafeAppIcon from '@/components/safe-apps/SafeAppIcon'
import Msg from '@/components/safeMessages/Msg'
import EthHashInfo from '@/components/common/EthHashInfo'
import RequiredIcon from '@/public/images/messages/required.svg'
import { dispatchSafeMsgConfirmation, dispatchSafeMsgProposal } from '@/services/safe-messages/safeMsgSender'
import useSafeInfo from '@/hooks/useSafeInfo'

import txStepperCss from '@/components/tx/TxStepper/styles.module.css'

const APP_LOGO_FALLBACK_IMAGE = '/images/apps/apps-icon.svg'

type BaseProps = {
  onClose: () => void
} & Pick<SafeMessage, 'logoUri' | 'name' | 'message'>

type ProposeProps = BaseProps & {
  safeAppId: number
  messageHash?: never
}

// A proposed message does not return the `safeAppId` but the `logoUri` and `name` of the Safe App that proposed it
type ConfirmProps = BaseProps & {
  safeAppId?: never
  messageHash: string
}

const MsgModal = ({
  onClose,
  logoUri = APP_LOGO_FALLBACK_IMAGE,
  name,
  message,
  messageHash,
  safeAppId,
}: ProposeProps | ConfirmProps): ReactElement => {
  const { safe } = useSafeInfo()

  const onSign = () => {
    if (safeAppId) {
      dispatchSafeMsgProposal(safe, message, safeAppId)
    } else if (messageHash) {
      dispatchSafeMsgConfirmation(safe, messageHash)
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
          {messageHash && (
            <>
              <Typography fontWeight={700} mt={2}>
                Hash:
              </Typography>
              <EthHashInfo address={messageHash} showAvatar={false} shortAddress={false} showCopyButton />
            </>
          )}
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
