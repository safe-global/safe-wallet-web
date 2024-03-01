import { PendingSafeStatus, selectUndeployedSafe } from '@/features/counterfactual/store/undeployedSafesSlice'
import useSafeInfo from '@/hooks/useSafeInfo'
import InfoIcon from '@/public/images/notifications/info.svg'
import { useAppSelector } from '@/store'
import LoopRoundedIcon from '@mui/icons-material/LoopRounded'
import { IconButton, Tooltip } from '@mui/material'
import classnames from 'classnames'
import css from './styles.module.css'

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

const processingStates = [PendingSafeStatus.PROCESSING, PendingSafeStatus.RELAYING]

const CounterfactualStatusButton = () => {
  const { safe, safeAddress } = useSafeInfo()
  const undeployedSafe = useAppSelector((state) => selectUndeployedSafe(state, safe.chainId, safeAddress))

  if (safe.deployed) return null

  const processing = undeployedSafe && processingStates.includes(undeployedSafe.status.status)

  return (
    <Tooltip
      placement="right"
      title={processing ? 'Safe Account is being activated' : 'Safe Account is not activated'}
      arrow
    >
      <IconButton
        data-testid="pending-activation-icon"
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
