import { Grid, Paper } from '@mui/material'
import type { ReactElement } from 'react'
import { TransactionStatus, type Transaction } from '@gnosis.pm/safe-react-gateway-sdk'

import DateTime from '@/components/common/DateTime'
import TxInfo from '@/components/transactions/TxInfo'
import SignTxButton from '@/components/transactions/SignTxButton'
import useWallet from '@/services/wallets/useWallet'
import { useTransactionType } from '@/services/useTransactionType'
import { isMultisigExecutionInfo } from '@/components/transactions/TxList/utils'
import css from './styles.module.css'

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
  const walletAddress = wallet?.address
  const type = useTransactionType(tx)

  const missingSigners = isMultisigExecutionInfo(tx.executionInfo) ? tx.executionInfo.missingSigners : null
  const signaturePending = missingSigners?.some((item) => item.value.toLowerCase() === walletAddress?.toLowerCase())

  return (
    <Paper>
      <div className={css.container} id={tx.id}>
        <Grid container>
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
            {tx.txStatus !== TransactionStatus.SUCCESS && tx.txStatus}
          </Grid>

          <Grid item md={1}>
            {tx.txStatus !== TransactionStatus.SUCCESS && signaturePending && (
              <SignTxButton txSummary={item.transaction} />
            )}
          </Grid>
        </Grid>
      </div>
    </Paper>
  )
}

export default TxSummary
