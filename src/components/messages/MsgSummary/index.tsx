import { Box, CircularProgress, Typography } from '@mui/material'
import type { Palette } from '@mui/material'
import type { ReactElement } from 'react'

import DateTime from '@/components/common/DateTime'
import useWallet from '@/hooks/wallets/useWallet'
import useIsWrongChain from '@/hooks/useIsWrongChain'
import { MessageStatus } from '@/hooks/useMessages'
import MsgType from '@/components/messages/MsgType'
import SignMsgButton from '@/components/messages/SignMsgButton'
import useMessageStatus from '@/hooks/useMessageStatus'
import useIsMsgPending from '@/hooks/useIsMsgPending'
import TxConfirmations from '@/components/transactions/TxConfirmations'
import classNames from 'classnames'
import type { Message } from '@/hooks/useMessages'

import txSummaryCss from '@/components/transactions/TxSummary/styles.module.css'

const getStatusColor = (value: MessageStatus, palette: Palette) => {
  switch (value) {
    case MessageStatus.CONFIRMED:
      return palette.success.main
    case MessageStatus.NEEDS_CONFIRMATION:
      return palette.warning.main
    default:
      return palette.primary.main
  }
}

const MsgSummary = ({ item }: { item: Message }): ReactElement => {
  const { confirmationsSubmitted, confirmationsRequired } = item
  const wallet = useWallet()
  const isWrongChain = useIsWrongChain()
  const txStatusLabel = useMessageStatus(item)
  const isPending = useIsMsgPending(item.messageHash)
  const isConfirmed = item.status === MessageStatus.CONFIRMED

  return (
    <Box className={classNames(txSummaryCss.gridContainer, txSummaryCss.columnTemplateWithoutNonce)}>
      <Box gridArea="type" className={txSummaryCss.columnWrap}>
        <MsgType msg={item} />
      </Box>

      <Box gridArea="info" className={txSummaryCss.columnWrap}>
        Off-chain signature
      </Box>

      <Box gridArea="date">
        <DateTime value={item.modifiedTimestamp} />
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
          <SignMsgButton msg={item} compact />
        </Box>
      )}

      <Box
        gridArea="status"
        marginLeft={{ sm: 'auto' }}
        marginRight={1}
        display="flex"
        alignItems="center"
        gap={1}
        color={({ palette }) => getStatusColor(item.status, palette)}
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
