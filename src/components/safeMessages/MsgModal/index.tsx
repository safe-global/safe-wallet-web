import { Grid, DialogActions, Button, Box, Typography, DialogContent, SvgIcon } from '@mui/material'
import type { ReactElement } from 'react'

import ModalDialog, { ModalDialogTitle } from '@/components/common/ModalDialog'
import ImageFallback from '@/components/common/ImageFallback'
import Msg from '@/components/safeMessages/Msg'
import EthHashInfo from '@/components/common/EthHashInfo'
import RequiredIcon from '@/public/images/messages/required.svg'
import type { SafeMessage } from '@/store/safeMessagesSlice'

import txStepperCss from '@/components/tx/TxStepper/styles.module.css'
import safeAppsModalLabelCss from '@/components/safe-apps/SafeAppsModalLabel/styles.module.css'
// import { dispatchMsgConfirmation, dispatchMsgProposal } from '@/services/msg/msgSender'

const APP_LOGO_FALLBACK_IMAGE = '/images/apps/apps-icon.svg'

const MsgModal = ({ onClose, msg }: { onClose: () => void; msg: SafeMessage }): ReactElement => {
  const onSign = () => {
    onClose()
    // if (msg.messageHash) {
    //   dispatchMsgConfirmation(msg.messageHash)
    // } else {
    //   // TODO: Pass `eth_sign`/`eth_signTypedData` payload to `dispatchMsgProposal`
    //   const payload = {}
    //   dispatchMsgProposal(payload)
    // }
  }

  return (
    <ModalDialog open onClose={onClose} maxWidth="sm" fullWidth>
      <div className={txStepperCss.container}>
        <ModalDialogTitle onClose={onClose}>
          <Grid container px={1} alignItems="center" gap={2}>
            <Grid item>
              <Box display="flex" alignItems="center">
                <ImageFallback
                  src={msg.logoUri}
                  fallbackSrc={APP_LOGO_FALLBACK_IMAGE}
                  alt={msg.name}
                  className={safeAppsModalLabelCss.modalLabel}
                  width={24}
                  height={24}
                />
                <Typography variant="h4">{msg.name}</Typography>
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
          <Msg message={msg.message} />
          {msg.messageHash && (
            <>
              <Typography fontWeight={700} mt={2}>
                Hash:
              </Typography>
              <EthHashInfo address={msg.messageHash} showAvatar={false} shortAddress={false} showCopyButton />
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
