import { Grid, Paper } from '@mui/material'
import type { ReactElement } from 'react'
import { TransactionStatus, type MultisigExecutionInfo, type Transaction } from '@gnosis.pm/safe-react-gateway-sdk'

import DateTime from '@/components/common/DateTime'
import TxInfo from '@/components/transactions/TxInfo'
import SignTxButton from '@/components/transactions/SignTxButton'
import useWallet from '@/services/wallets/useWallet'
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

  const missingSigners = (item.transaction?.executionInfo as MultisigExecutionInfo)?.missingSigners
  const signaturePending = missingSigners?.some((item) => item.value.toLowerCase() === walletAddress?.toLowerCase())

  return (
    <Paper>
      <div className={css.container} id={tx.id}>
        <Grid container>
          <Grid item md={1}>
            {tx.executionInfo && 'nonce' in tx.executionInfo ? tx.executionInfo.nonce : ''}
          </Grid>

          <Grid item md={3}>
            <DateTime value={tx.timestamp} options={dateOptions} />
          </Grid>

          <Grid item md={2}>
            {tx.txInfo.type}
          </Grid>

          <Grid item md>
            <TxInfo info={tx.txInfo} />
          </Grid>

          {tx.txStatus !== TransactionStatus.SUCCESS && (
            <>
              <Grid item md={3}>
                {tx.txStatus}
              </Grid>

              <Grid item md={1}>
                {signaturePending && <SignTxButton txSummary={item.transaction} />}
              </Grid>
            </>
          )}
        </Grid>
      </div>
    </Paper>
  )
}

export default TxSummary
