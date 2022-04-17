import { type ReactElement } from 'react'
import { MultisigExecutionInfo, Transaction, TransactionStatus } from '@gnosis.pm/safe-react-gateway-sdk'
import { Grid, Paper } from '@mui/material'
import DateTime from 'components/common/DateTime'
import css from './styles.module.css'
import TxInfo from '../TxInfo'
import { useWalletAddress } from 'services/useSafeSDK'
import SignTxButton from '../SignTxButton'

type TxSummaryProps = {
  item: Transaction
}

const dateOptions = {
  timeStyle: 'short',
  hour12: true,
}

const TxSummary = ({ item }: TxSummaryProps): ReactElement => {
  const tx = item.transaction
  const walletAddress = useWalletAddress()

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
