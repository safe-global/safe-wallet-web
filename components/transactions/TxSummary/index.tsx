import { type ReactElement } from 'react'
import type { Transaction } from '@gnosis.pm/safe-react-gateway-sdk'
import { Grid, Paper } from '@mui/material'
import DateTime from 'components/common/DateTime'
import css from './styles.module.css'
import TxInfo from '../TxInfo'

type TxSummaryProps = {
  item: Transaction
}

const dateOptions = {
  timeStyle: 'short',
  hour12: true,
}

const TxSummary = ({ item }: TxSummaryProps): ReactElement => {
  const tx = item.transaction

  return (
    <Paper>
      <div className={css.container} id={tx.id}>
        <Grid container>
          <Grid item xs={1}>
            {tx.executionInfo && 'nonce' in tx.executionInfo ? tx.executionInfo.nonce : ''}
          </Grid>

          <Grid item xs={3}>
            <DateTime value={tx.timestamp} options={dateOptions} />
          </Grid>

          <Grid item xs={4}>
            {tx.txInfo.type}
          </Grid>

          <Grid item xs>
            <TxInfo info={tx.txInfo} />
          </Grid>
        </Grid>
      </div>
    </Paper>
  )
}

export default TxSummary
