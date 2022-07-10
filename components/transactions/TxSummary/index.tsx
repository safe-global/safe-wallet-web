import { Grid, Box } from '@mui/material'
import { ReactElement } from 'react'
import { TransactionStatus, type Transaction } from '@gnosis.pm/safe-react-gateway-sdk'

import DateTime from '@/components/common/DateTime'
import TxInfo from '@/components/transactions/TxInfo'
import SignTxButton from '@/components/transactions/SignTxButton'
import ExecuteTxButton from '@/components/transactions/ExecuteTxButton'
import css from './styles.module.css'
import useWallet from '@/hooks/wallets/useWallet'
import { isAwaitingExecution } from '@/utils/transaction-guards'
import RejectTxButton from '@/components/transactions/RejectTxButton'
import { useTransactionStatus } from '@/hooks/useTransactionStatus'
import TxType from '@/components/transactions/TxType'

type TxSummaryProps = {
  item: Transaction
}

const dateOptions = {
  timeStyle: 'short',
  hour12: true,
}

const TxSummary = ({ item }: TxSummaryProps): ReactElement => {
  const tx = item.transaction
  const wallet = useWallet()
  const txStatusLabel = useTransactionStatus(tx)
  const isQueue = tx.txStatus !== TransactionStatus.SUCCESS
  const awaitingExecution = isAwaitingExecution(item.transaction.txStatus)
  const nonce = tx.executionInfo && 'nonce' in tx.executionInfo ? tx.executionInfo.nonce : ''

  return (
    <Grid container className={css.gridContainer} id={tx.id} gap={2} p={1}>
      <Grid item md>
        {nonce}
      </Grid>

      <Grid item md={4}>
        <TxType tx={tx} />
      </Grid>

      <Grid item md={4}>
        <TxInfo info={tx.txInfo} />
      </Grid>

      <Grid item xs sx={{ whiteSpace: 'nowrap' }}>
        <DateTime value={tx.timestamp} options={dateOptions} />
      </Grid>

      <Grid item>{txStatusLabel}</Grid>

      {wallet && isQueue && (
        <Grid item>
          <Box display="flex" alignItems="center">
            {awaitingExecution ? (
              <ExecuteTxButton txSummary={item.transaction} />
            ) : (
              <SignTxButton txSummary={item.transaction} />
            )}
            <RejectTxButton txSummary={item.transaction} />
          </Box>
        </Grid>
      )}
    </Grid>
  )
}

export default TxSummary
