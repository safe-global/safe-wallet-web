import { Grid, Paper } from '@mui/material'
import type { ReactElement } from 'react'
import { TransactionStatus, type Transaction } from '@gnosis.pm/safe-react-gateway-sdk'

import DateTime from '@/components/common/DateTime'
import TxInfo from '@/components/transactions/TxInfo'
import SignTxButton from '@/components/transactions/SignTxButton'
import { useTransactionType } from '@/services/useTransactionType'
import ExecuteTxButton from '@/components/transactions/ExecuteTxButton'
import css from './styles.module.css'
import useWallet from '@/services/wallets/useWallet'
import { isAwaitingExecution } from '@/components/transactions/utils'
import RejectTxButton from '@/components/transactions/RejectTxButton'
import Box from '@mui/material/Box'
import { useRouter } from 'next/router'
import { useTransactionStatus } from '@/services/useTransactionStatus'

type TxSummaryProps = {
  item: Transaction
}

const dateOptions = {
  timeStyle: 'short',
  hour12: true,
}

const TxSummary = ({ item }: TxSummaryProps): ReactElement => {
  const tx = item.transaction
  const type = useTransactionType(tx)
  const wallet = useWallet()
  const router = useRouter()
  const isQueue = router.pathname.includes('queue')
  const txStatus = useTransactionStatus(tx)

  const awaitingExecution = isAwaitingExecution(item.transaction.txStatus)

  return (
    <Paper sx={{ width: '100%', borderRadius: '4px', boxShadow: 'unset' }}>
      <div className={css.container} id={tx.id}>
        <Grid container className={css.gridContainer}>
          <Grid item md={1}>
            {tx.executionInfo && 'nonce' in tx.executionInfo ? tx.executionInfo.nonce : ''}
          </Grid>

          <Grid item md={3}>
            <img src={type.icon} alt="transaction type" width={16} height={16} className={css.txTypeIcon} />
            {type.text}
          </Grid>

          <Grid item md>
            <TxInfo info={tx.txInfo} />
          </Grid>

          <Grid item md={2}>
            <DateTime value={tx.timestamp} options={dateOptions} />
          </Grid>

          <Grid item md={3}>
            {txStatus !== TransactionStatus.SUCCESS && txStatus}
          </Grid>

          {wallet && isQueue && (
            <Grid item md={1}>
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
      </div>
    </Paper>
  )
}

export default TxSummary
