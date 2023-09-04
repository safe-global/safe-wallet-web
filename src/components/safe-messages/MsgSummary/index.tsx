import { Box, CircularProgress, Typography } from '@mui/material'
import type { Palette } from '@mui/material'
import type { ReactElement } from 'react'
import { SafeMessageStatus } from '@safe-global/safe-gateway-typescript-sdk'
import type { SafeMessage } from '@safe-global/safe-gateway-typescript-sdk'

import DateTime from '@/components/common/DateTime'
import useWallet from '@/hooks/wallets/useWallet'
import MsgType from '@/components/safe-messages/MsgType'
import SignMsgButton from '@/components/safe-messages/SignMsgButton'
import useSafeMessageStatus from '@/hooks/messages/useSafeMessageStatus'
import useIsSafeMessagePending from '@/hooks/messages/useIsSafeMessagePending'
import TxConfirmations from '@/components/transactions/TxConfirmations'
import classNames from 'classnames'

import txSummaryCss from '@/components/transactions/TxSummary/styles.module.css'

const getStatusColor = (value: SafeMessageStatus, palette: Palette) => {
  switch (value) {
    case SafeMessageStatus.CONFIRMED:
      return palette.success.main
    case SafeMessageStatus.NEEDS_CONFIRMATION:
      return palette.warning.main
    default:
      return palette.primary.main
  }
}

const MsgSummary = ({ msg }: { msg: SafeMessage }): ReactElement => {
  const { confirmationsSubmitted, confirmationsRequired } = msg
  const wallet = useWallet()
  const txStatusLabel = useSafeMessageStatus(msg)
  const isPending = useIsSafeMessagePending(msg.messageHash)
  const isConfirmed = msg.status === SafeMessageStatus.CONFIRMED

  return (
    <Box className={classNames(txSummaryCss.gridContainer, txSummaryCss.columnTemplateWithoutNonce)}>
      <Box gridArea="type" className={txSummaryCss.columnWrap}>
        <MsgType msg={msg} />
      </Box>

      <Box gridArea="info" className={txSummaryCss.columnWrap}>
        Off-chain signature
      </Box>

      <Box gridArea="date">
        <DateTime value={msg.modifiedTimestamp} />
      </Box>

      {!!confirmationsRequired && (
        <Box gridArea="confirmations" display="flex" alignItems="center" gap={1}>
          <TxConfirmations
            submittedConfirmations={confirmationsSubmitted}
            requiredConfirmations={confirmationsRequired}
          />
        </Box>
      )}

      {wallet && !isConfirmed && (
        <Box gridArea="actions" display="flex" justifyContent={{ sm: 'center' }} gap={1}>
          <SignMsgButton msg={msg} compact />
        </Box>
      )}

      <Box
        gridArea="status"
        marginLeft={{ sm: 'auto' }}
        marginRight={1}
        display="flex"
        alignItems="center"
        gap={1}
        color={({ palette }) => getStatusColor(msg.status, palette)}
      >
        {isPending && <CircularProgress size={14} color="inherit" />}

        <Typography variant="caption" fontWeight="bold">
          {txStatusLabel}
        </Typography>
      </Box>
    </Box>
  )
}

export default MsgSummary
