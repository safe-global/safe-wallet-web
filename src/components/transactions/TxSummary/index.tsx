import { type Palette } from '@mui/material'
import { Box, Typography } from '@mui/material'
import type { ReactElement } from 'react'
import { type Transaction, TransactionStatus } from '@safe-global/safe-gateway-typescript-sdk'

import css from './styles.module.css'
import DateTime from '@/components/common/DateTime'
import TxInfo from '@/components/transactions/TxInfo'
import { isMultisigExecutionInfo, isTxQueued } from '@/utils/transaction-guards'
import useTransactionStatus from '@/hooks/useTransactionStatus'
import TxType from '@/components/transactions/TxType'
import classNames from 'classnames'
import { isTrustedTx } from '@/utils/transactions'
import UntrustedTxWarning from '../UntrustedTxWarning'
import QueueActions from './QueueActions'

const getStatusColor = (value: TransactionStatus, palette: Palette | Record<string, Record<string, string>>) => {
  switch (value) {
    case TransactionStatus.SUCCESS:
      return palette.success.main
    case TransactionStatus.FAILED:
    case TransactionStatus.CANCELLED:
      return palette.error.main
    case TransactionStatus.AWAITING_CONFIRMATIONS:
    case TransactionStatus.AWAITING_EXECUTION:
      return palette.warning.main
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
  const txStatusLabel = useTransactionStatus(tx)
  const isQueue = isTxQueued(tx.txStatus)
  const nonce = isMultisigExecutionInfo(tx.executionInfo) ? tx.executionInfo.nonce : undefined
  const isTrusted = isTrustedTx(tx)

  return (
    <Box
      data-testid="transaction-item"
      className={classNames(
        css.gridContainer,
        isQueue ? css.columnTemplate : css.columnTemplateTxHistory,
        isGrouped ? css.grouped : undefined,
        !isTrusted ? css.untrusted : undefined,
      )}
      id={tx.id}
    >
      {nonce && !isGrouped && (
        <Box gridArea="nonce" data-testid="nonce" className={css.nonce}>
          {nonce}
        </Box>
      )}

      {!isTrusted && (
        <Box data-testid="warning" gridArea="nonce">
          <UntrustedTxWarning />
        </Box>
      )}

      <Box gridArea="type" data-testid="tx-type">
        <TxType tx={tx} />
      </Box>

      <Box gridArea="info" data-testid="tx-info">
        <TxInfo info={tx.txInfo} />
      </Box>

      <Box gridArea="date" data-testid="tx-date" className={css.date}>
        <Typography color="text.secondary">
          <DateTime value={tx.timestamp} />
        </Typography>
      </Box>

      {isQueue ? (
        <QueueActions tx={tx} />
      ) : (
        <Typography
          gridArea="status"
          data-testid="tx-status"
          variant="caption"
          fontWeight="bold"
          color={({ palette }) => getStatusColor(tx.txStatus, palette)}
        >
          {txStatusLabel}
        </Typography>
      )}
    </Box>
  )
}

export default TxSummary
