import { Box, Typography } from '@mui/material'
import type { ReactElement } from 'react'
import { type Transaction } from '@safe-global/safe-gateway-typescript-sdk'

import css from './styles.module.css'
import DateTime from '@/components/common/DateTime'
import TxInfo from '@/components/transactions/TxInfo'
import { isMultisigExecutionInfo, isTxQueued } from '@/utils/transaction-guards'
import TxType from '@/components/transactions/TxType'
import classNames from 'classnames'
import { isTrustedTx } from '@/utils/transactions'
import UntrustedTxWarning from '../UntrustedTxWarning'
import QueueActions from './QueueActions'
import useIsPending from '@/hooks/useIsPending'
import TxStatusLabel from '../TxStatusLabel'

type TxSummaryProps = {
  isGrouped?: boolean
  item: Transaction
}

const TxSummary = ({ item, isGrouped }: TxSummaryProps): ReactElement => {
  const tx = item.transaction
  const isQueue = isTxQueued(tx.txStatus)
  const nonce = isMultisigExecutionInfo(tx.executionInfo) ? tx.executionInfo.nonce : undefined
  const isTrusted = isTrustedTx(tx)
  const isPending = useIsPending(tx.id)

  return (
    <Box
      data-testid="transaction-item"
      className={classNames(
        css.gridContainer,
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

      <Box gridArea="status" pr={2} display="flex" gap={2}>
        {isQueue && <QueueActions tx={tx} showActions={!isPending} />}

        {(!isQueue || isPending) && <TxStatusLabel tx={tx} />}
      </Box>
    </Box>
  )
}

export default TxSummary
