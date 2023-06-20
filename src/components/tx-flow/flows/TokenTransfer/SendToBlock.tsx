import { Grid, Typography } from '@mui/material'
import EthHashInfo from '@/components/common/EthHashInfo'
import css from '@/components/tx/modals/TokenTransferModal/styles.module.css'

const SendToBlock = ({ address }: { address: string; title?: string }) => {
  return (
    <Grid container gap={1}>
      <Grid item xs={2}>
        To
      </Grid>
      <Grid item className={css.token}>
        <Typography variant="body2" component="div">
          <EthHashInfo address={address} shortAddress={false} hasExplorer showCopyButton />
        </Typography>
      </Grid>
    </Grid>
  )
}

export default SendToBlock
