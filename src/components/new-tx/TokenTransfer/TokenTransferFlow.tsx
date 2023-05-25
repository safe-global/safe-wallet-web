import { TokenTransfer } from '@/components/new-tx/TokenTransfer/index'
import { SendTxType } from '@/components/tx/modals/TokenTransferModal/SendAssetsForm'
import CreateTokenTransfer from '@/components/new-tx/TokenTransfer/CreateTokenTransfer'
import ReviewTokenTransfer from '@/components/new-tx/TokenTransfer/ReviewTokenTransfer'

import css from 'src/components/new-tx/TokenTransfer/styles.module.css'
import { Grid, Paper, Typography } from '@mui/material'
import { ProgressBar } from '@/components/common/ProgressBar'

const initialData = {
  recipient: '',
  tokenAddress: '',
  amount: '',
  type: SendTxType.multiSig,
}

const TokenTransferFlow = ({ disableSpendingLimit, txNonce }: { disableSpendingLimit?: boolean; txNonce?: number }) => {
  const steps = [
    <CreateTokenTransfer key={0} disableSpendingLimit={disableSpendingLimit} />,
    <ReviewTokenTransfer key={1} txNonce={txNonce} />,
  ]

  return (
    <TokenTransfer steps={steps} defaultValues={[initialData, {}]}>
      {(Step, values) => {
        return (
          <Grid container className={css.wrapper} alignItems="center" justifyContent="center">
            <Grid item xs={10}>
              <Typography variant="h3" component="div" fontWeight="700" mb={2}>
                Send Tokens
              </Typography>
            </Grid>
            <Grid item container xs={10}>
              <Grid item xs={8} component={Paper}>
                <ProgressBar value={values.progress} />
                {Step}
              </Grid>
              <Grid item xs={4}>
                Side area
              </Grid>
            </Grid>
          </Grid>
        )
      }}
    </TokenTransfer>
  )
}

export default TokenTransferFlow
