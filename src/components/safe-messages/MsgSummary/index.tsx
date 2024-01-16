import { Box, CircularProgress } from '@mui/material'
import type { ReactElement } from 'react'
import { SafeMessageStatus } from '@safe-global/safe-gateway-typescript-sdk'
import type { SafeMessage } from '@safe-global/safe-gateway-typescript-sdk'

import DateTime from '@/components/common/DateTime'
import MsgType from '@/components/safe-messages/MsgType'
import SignMsgButton from '@/components/safe-messages/SignMsgButton'
import useSafeMessageStatus from '@/hooks/messages/useSafeMessageStatus'
import TxConfirmations from '@/components/transactions/TxConfirmations'

import css from './styles.module.css'
import useIsSafeMessagePending from '@/hooks/messages/useIsSafeMessagePending'
import TxStatusChip from '@/components/transactions/TxStatusChip'

const getStatusColor = (value: SafeMessageStatus): string => {
  switch (value) {
    case SafeMessageStatus.CONFIRMED:
      return 'success'
    case SafeMessageStatus.NEEDS_CONFIRMATION:
      return 'warning'
    default:
      return 'primary'
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
        {!!confirmationsRequired && (
          <TxConfirmations
            submittedConfirmations={confirmationsSubmitted}
            requiredConfirmations={confirmationsRequired}
          />
        )}
      </Box>

      <Box gridArea="status">
        {isConfirmed ? (
          <TxStatusChip color={getStatusColor(msg.status)}>
            {isPending && <CircularProgress size={14} color="inherit" />}

            {txStatusLabel}
          </TxStatusChip>
        ) : (
          <SignMsgButton msg={msg} compact />
        )}
      </Box>
    </Box>
  )
}

export default MsgSummary
