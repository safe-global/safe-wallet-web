import { Box, Palette, Typography } from '@mui/material'
import { ReactElement } from 'react'
import { type Transaction, TransactionStatus } from '@gnosis.pm/safe-react-gateway-sdk'

import DateTime from '@/components/common/DateTime'
import TxInfo from '@/components/transactions/TxInfo'
import SignTxButton from '@/components/transactions/SignTxButton'
import ExecuteTxButton from '@/components/transactions/ExecuteTxButton'
import css from './styles.module.css'
import useWallet from '@/hooks/wallets/useWallet'
import { isAwaitingExecution, isMultisigExecutionInfo, isTxQueued } from '@/utils/transaction-guards'
import RejectTxButton from '@/components/transactions/RejectTxButton'
import { useTransactionStatus } from '@/hooks/useTransactionStatus'
import TxType from '@/components/transactions/TxType'
import GroupIcon from '@mui/icons-material/Group'
import useIsWrongChain from '@/hooks/useIsWrongChain'

const getStatusColor = (value: TransactionStatus, palette: Palette) => {
  switch (value) {
    case TransactionStatus.SUCCESS:
      return palette.primary.main
    case TransactionStatus.FAILED:
    case TransactionStatus.CANCELLED:
      return palette.error.main
    case TransactionStatus.AWAITING_CONFIRMATIONS:
    case TransactionStatus.AWAITING_EXECUTION:
      return palette.warning.dark
    default:
      return palette.primary.main
  }
}

type TxSummaryProps = {
  isGrouped?: boolean
  item: Transaction
}

const TxSummary = ({ item, isGrouped }: TxSummaryProps): ReactElement => {
  const tx = item.transaction
  const wallet = useWallet()
  const isWrongChain = useIsWrongChain()
  const txStatusLabel = useTransactionStatus(tx)
  const isQueue = isTxQueued(tx.txStatus)
  const awaitingExecution = isAwaitingExecution(tx.txStatus)
  const nonce = isMultisigExecutionInfo(tx.executionInfo) ? tx.executionInfo.nonce : undefined
  const submittedConfirmations = isMultisigExecutionInfo(tx.executionInfo)
    ? tx.executionInfo.confirmationsSubmitted
    : undefined
  const requiredConfirmations = isMultisigExecutionInfo(tx.executionInfo)
    ? tx.executionInfo.confirmationsRequired
    : undefined

  const displayConfirmations = isQueue && submittedConfirmations && requiredConfirmations

  return (
    <Box
      className={`${css.gridContainer} ${nonce && !isGrouped ? css.columnTemplate : css.columnTemplateWithoutNonce}`}
      id={tx.id}
    >
      {nonce && !isGrouped && <Box gridArea="nonce">{nonce}</Box>}

      <Box gridArea="type">
        <TxType tx={tx} />
      </Box>

      <Box gridArea="info">
        <TxInfo info={tx.txInfo} />
      </Box>

      <Box gridArea="date">
        <DateTime value={tx.timestamp} />
      </Box>

      {displayConfirmations && (
        <Box gridArea="confirmations" display="flex" alignItems="center" gap={1}>
          <GroupIcon fontSize="small" color="border" />
          <Typography
            variant="caption"
            fontWeight="bold"
            color={requiredConfirmations > submittedConfirmations ? 'border.main' : 'primary'}
          >
            {submittedConfirmations} out of {requiredConfirmations}
          </Typography>
        </Box>
      )}

      {wallet && !isWrongChain && isQueue && (
        <Box gridArea="actions">
          {awaitingExecution ? (
            <ExecuteTxButton txSummary={item.transaction} compact />
          ) : (
            <SignTxButton txSummary={item.transaction} compact />
          )}
          <RejectTxButton txSummary={item.transaction} compact />
        </Box>
      )}

      <Box gridArea="status" marginLeft={{ md: 'auto' }} marginRight={1}>
        <Typography variant="caption" fontWeight="bold" color={({ palette }) => getStatusColor(tx.txStatus, palette)}>
          {txStatusLabel}
        </Typography>
      </Box>
    </Box>
  )
}

export default TxSummary
