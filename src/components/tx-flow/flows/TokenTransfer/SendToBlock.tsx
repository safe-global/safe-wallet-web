import { Grid, Typography } from '@mui/material'
import EthHashInfo from '@/components/common/EthHashInfo'

const SendToBlock = ({ address, title = 'To' }: { address: string; title?: string }) => {
  return (
    <Grid container gap={1} alignItems="center">
      <Grid item xs={2}>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </Grid>
      <Grid item>
        <Typography variant="body2" component="div">
          <EthHashInfo address={address} shortAddress={false} hasExplorer showCopyButton />
        </Typography>
      </Grid>
    </Grid>
  )
}

export default SendToBlock
