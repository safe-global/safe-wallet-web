import { Grid, Typography } from '@mui/material'
import EthHashInfo from '@/components/common/EthHashInfo'

const SendToBlock = ({ address }: { address: string; title?: string }) => {
  return (
    <Grid container gap={1}>
      <Grid item xs={2}>
        To
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
