import { Box, CircularProgress, Typography } from '@mui/material'
import type { Palette } from '@mui/material'
import type { ReactElement } from 'react'

import DateTime from '@/components/common/DateTime'
import useWallet from '@/hooks/wallets/useWallet'
import useIsWrongChain from '@/hooks/useIsWrongChain'
import { SignedMessageStatus } from '@/store/signedMessagesSlice'
import MsgType from '@/components/signedMessages/MsgType'
import SignMsgButton from '@/components/signedMessages/SignMsgButton'
import useSignedMessageStatus from '@/hooks/useSignedMessageStatus'
import useIsSignedMessagePending from '@/hooks/useIsSignedMessagePending'
import TxConfirmations from '@/components/transactions/TxConfirmations'
import classNames from 'classnames'
import type { SignedMessage } from '@/store/signedMessagesSlice'

import txSummaryCss from '@/components/transactions/TxSummary/styles.module.css'

const getStatusColor = (value: SignedMessageStatus, palette: Palette) => {
  switch (value) {
    case SignedMessageStatus.CONFIRMED:
      return palette.success.main
    case SignedMessageStatus.NEEDS_CONFIRMATION:
      return palette.warning.main
    default:
      return palette.primary.main
  }
}

const MsgSummary = ({ msg }: { msg: SignedMessage }): ReactElement => {
  const { confirmationsSubmitted, confirmationsRequired } = msg
  const wallet = useWallet()
  const isWrongChain = useIsWrongChain()
  const txStatusLabel = useSignedMessageStatus(msg)
  const isPending = useIsSignedMessagePending(msg.messageHash)
  const isConfirmed = msg.status === SignedMessageStatus.CONFIRMED

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

      {wallet && !isWrongChain && !isConfirmed && (
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
