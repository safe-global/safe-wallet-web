import { LinearProgress, Stack, Typography } from '@mui/material'

const SwapProgress = ({
  progress,
  tokenAmount,
  tokenSymbol,
}: {
  progress: string
  tokenAmount: string
  tokenSymbol: string
}) => {
  const progressValue = Math.min(Math.max(Number(progress), 0), 100)
  const isFilled = progressValue >= 100
  const soldAmount = Number(tokenAmount) * (progressValue / 100)
  const color = isFilled ? 'success' : 'warning'

  return (
    <Stack direction="row" alignItems="center" gap={1}>
      <LinearProgress variant="determinate" value={progressValue} sx={{ flex: 1, borderRadius: '6px' }} color={color} />
      <Typography color={`${color}.main`}>{progressValue} %</Typography>
      <Typography>
        <Typography component="span" fontWeight="bold">
          {soldAmount} {tokenSymbol}
        </Typography>{' '}
        sold
      </Typography>
    </Stack>
  )
}

export default SwapProgress
