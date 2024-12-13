import { Box, CircularProgress, type Palette, Typography } from '@mui/material'
import type { ReactElement } from 'react'
import { SafeMessageStatus } from '@safe-global/safe-gateway-typescript-sdk'
import type { SafeMessage } from '@safe-global/safe-gateway-typescript-sdk'

import DateTime from '@/components/common/DateTime'
import MsgType from '@/components/safe-messages/MsgType'
import SignMsgButton from '@/components/safe-messages/SignMsgButton'
import useSafeMessageStatus from '@/hooks/messages/useSafeMessageStatus'
import TxConfirmations from '@/components/transactions/TxConfirmations'

import css from '@/components/transactions/TxSummary/styles.module.css'
import useIsSafeMessagePending from '@/hooks/messages/useIsSafeMessagePending'

const getStatusColor = (value: SafeMessageStatus, palette: Palette): string => {
  switch (value) {
    case SafeMessageStatus.CONFIRMED:
      return palette.success.main
    case SafeMessageStatus.NEEDS_CONFIRMATION:
      return palette.warning.main
    default:
      return palette.text.primary
  }
}

const MsgSummary = ({ msg }: { msg: SafeMessage }): ReactElement => {
  const { confirmationsSubmitted, confirmationsRequired } = msg
  const txStatusLabel = useSafeMessageStatus(msg)
  const isConfirmed = msg.status === SafeMessageStatus.CONFIRMED
  const isPending = useIsSafeMessagePending(msg.messageHash)

  return (
    <Box className={css.gridContainer}>
      <Box gridArea="type">
        <MsgType msg={msg} />
      </Box>

      <Box gridArea="info">Off-chain signature</Box>

      <Box gridArea="date" className={css.date}>
        <DateTime value={msg.modifiedTimestamp} />
      </Box>

      <Box gridArea="confirmations">
        {confirmationsRequired > 0 && (
          <TxConfirmations
            submittedConfirmations={confirmationsSubmitted}
            requiredConfirmations={confirmationsRequired}
          />
        )}
      </Box>

      <Box gridArea="status">
        {isConfirmed || isPending ? (
          <Typography
            variant="caption"
            fontWeight="bold"
            display="flex"
            alignItems="center"
            gap={1}
            color={({ palette }) => getStatusColor(msg.status, palette)}
          >
            {isPending && <CircularProgress size={14} color="inherit" />}

            {txStatusLabel}
          </Typography>
        ) : (
          <SignMsgButton msg={msg} compact />
        )}
      </Box>
    </Box>
  )
}

export default MsgSummary
