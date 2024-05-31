import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

import css from './styles.module.css'
import { Button, Paper, Stack } from '@mui/material'
import type { SafeAppData } from '@safe-global/safe-gateway-typescript-sdk'
import SafeAppIconCard from '../SafeAppIconCard'

type NativeFeatureCardProps = {
  details: SafeAppData
  onClick: () => void
  onDismiss: () => void
}

const NativeFeatureCard = ({ details, onClick, onDismiss }: NativeFeatureCardProps) => {
  return (
    <Paper className={css.safeAppContainer}>
      {/* Safe App Header */}
      <CardHeader
        className={css.safeAppHeader}
        avatar={
          <div className={css.safeAppIconContainer}>
            {/* <SvgIcon component={SwapIcon} inheritViewBox /> */}
            <SafeAppIconCard src={details.iconUrl} alt={details.name} width={24} height={24} />
          </div>
        }
      />

      <CardContent className={css.safeAppContent}>
        <Typography className={css.safeAppTitle} gutterBottom variant="h5">
          {details.name}
        </Typography>

        <Typography className={css.safeAppDescription} variant="body2" color="text.secondary">
          {details.description}
        </Typography>

        <Stack direction="row" gap={2} className={css.buttons}>
          <Button onClick={onClick} size="small" variant="contained" sx={{ px: '16px' }}>
            Try now
          </Button>
          <Button onClick={onDismiss} size="small" variant="text" sx={{ px: '16px' }}>
            Don&apos;t show
          </Button>
        </Stack>
      </CardContent>
    </Paper>
  )
}

export default NativeFeatureCard
