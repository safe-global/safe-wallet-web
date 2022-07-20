import { Box, Typography } from '@mui/material'
import { ReactElement } from 'react'
import { TransactionStatus, type Transaction } from '@gnosis.pm/safe-react-gateway-sdk'

import DateTime from '@/components/common/DateTime'
import TxInfo from '@/components/transactions/TxInfo'
import SignTxButton from '@/components/transactions/SignTxButton'
import ExecuteTxButton from '@/components/transactions/ExecuteTxButton'
import css from './styles.module.css'
import useWallet from '@/hooks/wallets/useWallet'
import { isAwaitingExecution, isMultisigExecutionInfo } from '@/utils/transaction-guards'
import RejectTxButton from '@/components/transactions/RejectTxButton'
import { useTransactionStatus } from '@/hooks/useTransactionStatus'
import TxType from '@/components/transactions/TxType'
import GroupIcon from '@mui/icons-material/Group'

type TxSummaryProps = {
  isGrouped?: boolean
  item: Transaction
}

const dateOptions = {
  timeStyle: 'short',
  hour12: true,
}

const TxSummary = ({ item, isGrouped }: TxSummaryProps): ReactElement => {
  const tx = item.transaction
  const wallet = useWallet()
  const txStatusLabel = useTransactionStatus(tx)
  const isQueue = tx.txStatus !== TransactionStatus.SUCCESS
  const awaitingExecution = isAwaitingExecution(item.transaction.txStatus)
  const nonce = isMultisigExecutionInfo(tx.executionInfo) ? tx.executionInfo.nonce : undefined
  const submittedConfirmations = isMultisigExecutionInfo(tx.executionInfo)
    ? tx.executionInfo.confirmationsSubmitted
    : ''
  const requiredConfirmations = isMultisigExecutionInfo(tx.executionInfo) ? tx.executionInfo.confirmationsRequired : ''

  return (
    <Box className={`${css.gridContainer} ${nonce ? css.columnTemplate : css.columnTemplateWithoutNonce}`} id={tx.id}>
      {nonce && <Box gridArea="nonce">{isGrouped ? null : nonce}</Box>}

      <Box gridArea="type">
        <TxType tx={tx} />
      </Box>

      <Box gridArea="info">
        <TxInfo info={tx.txInfo} />
      </Box>

      <Box gridArea="date">
        <DateTime value={tx.timestamp} options={dateOptions} />
      </Box>

      {awaitingExecution && (
        <Box gridArea="confirmations" display="flex" alignItems="center" gap={1}>
          <GroupIcon fontSize="small" color="border" />
          <Typography variant="caption" fontWeight="bold" color="primary">
            {submittedConfirmations} out of {requiredConfirmations}
          </Typography>
        </Box>
      )}

      {wallet && isQueue && (
        <Box gridArea="actions">
          {awaitingExecution ? (
            <ExecuteTxButton txSummary={item.transaction} />
          ) : (
            <SignTxButton txSummary={item.transaction} />
          )}
          <RejectTxButton txSummary={item.transaction} />
        </Box>
      )}

      <Box gridArea="status" marginLeft={{ md: 'auto' }} marginRight={1}>
        <Typography
          variant="caption"
          fontWeight="bold"
          color={({ palette }) => (awaitingExecution ? palette.warning.dark : palette.primary.main)}
        >
          {txStatusLabel}
        </Typography>
      </Box>
    </Box>
  )
}

export default TxSummary
