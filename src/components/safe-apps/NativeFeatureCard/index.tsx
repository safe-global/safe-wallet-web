import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import SwapIcon from '@/public/images/common/swap.svg'

import css from './styles.module.css'
import { Button, Paper, Stack, SvgIcon } from '@mui/material'

const SafeAppCardGridView = () => (
  <Paper className={css.safeAppContainer}>
    {/* Safe App Header */}
    <CardHeader
      className={css.safeAppHeader}
      avatar={
        <div className={css.safeAppIconContainer}>
          {/* Safe App Icon */}
          <SvgIcon component={SwapIcon} inheritViewBox />
        </div>
      }
    />

    <CardContent className={css.safeAppContent}>
      {/* Safe App Title */}
      <Typography className={css.safeAppTitle} gutterBottom variant="h5">
        Native swaps are here!
      </Typography>

      {/* Safe App Description */}
      <Typography className={css.safeAppDescription} variant="body2" color="text.secondary">
        Experience seamless trading with better decoding and security in native swaps.
      </Typography>

      <Stack direction="row" gap={2} className={css.buttons}>
        <Button size="small" variant="contained" sx={{ px: '16px' }}>
          Try now
        </Button>
        <Button size="small" variant="text" sx={{ px: '16px' }}>
          Don&apos;t show
        </Button>
      </Stack>

      {/* <SafeAppTags tags={safeApp.tags} /> */}
    </CardContent>
  </Paper>
)

export default SafeAppCardGridView
