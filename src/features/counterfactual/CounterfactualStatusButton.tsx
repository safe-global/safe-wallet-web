import { IconButton, Tooltip } from '@mui/material'
import classnames from 'classnames'
import css from './styles.module.css'
import useSafeInfo from '@/hooks/useSafeInfo'
import InfoIcon from '@/public/images/notifications/info.svg'
import LoopRoundedIcon from '@mui/icons-material/LoopRounded'

const LoopIcon = () => {
  return (
    <LoopRoundedIcon
      sx={{
        animation: 'spin 2s linear infinite',
        '@keyframes spin': {
          '0%': {
            transform: 'rotate(360deg)',
          },
          '100%': {
            transform: 'rotate(0deg)',
          },
        },
      }}
    />
  )
}

const CounterfactualStatusButton = () => {
  const { safe } = useSafeInfo()

  if (safe.deployed) return null

  // TODO: Replace with pending state
  const processing = false

  return (
    <Tooltip
      placement="right"
      title={processing ? 'Safe Account is being activated' : 'Safe Account is not activated'}
      arrow
    >
      <IconButton
        className={classnames(css.statusButton, { [css.processing]: processing })}
        size="small"
        color={processing ? 'info' : 'warning'}
        disableRipple
      >
        {processing ? <LoopIcon /> : <InfoIcon />}
      </IconButton>
    </Tooltip>
  )
}

export default CounterfactualStatusButton
