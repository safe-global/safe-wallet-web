import { Grid, Typography } from '@mui/material'
import EthHashInfo from '@/components/common/EthHashInfo'

const SendToBlock = ({ address, title = 'To' }: { address: string; title?: string }) => {
  return (
    <Grid container gap={1} alignItems="center">
      <Grid item md>
        <Typography variant="body2" color="text.secondary" noWrap>
          {title}
        </Typography>
      </Grid>
      <Grid item xs={8} md={10}>
        <Typography variant="body2" component="div">
          <EthHashInfo address={address} shortAddress={false} hasExplorer showCopyButton />
        </Typography>
      </Grid>
    </Grid>
  )
}

export default SendToBlock
