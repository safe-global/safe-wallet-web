import { Chip, Typography } from '@mui/material'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { LoopIcon } from '@/features/counterfactual/CounterfactualStatusButton'
import classnames from 'classnames'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import css from './styles.module.css'

export const AccountStatusChip = ({ isActivating }: { isActivating: boolean }) => {
  return (
    <Chip
      size="small"
      label={isActivating ? 'Activating account' : 'Not activated'}
      icon={
        isActivating ? (
          <LoopIcon fontSize="small" className={css.pendingLoopIcon} sx={{ mr: '-4px', ml: '4px' }} />
        ) : (
          <ErrorOutlineIcon fontSize="small" color="warning" />
        )
      }
      className={classnames(css.chip, {
        [css.pendingAccount]: isActivating,
      })}
    />
  )
}

export const ReadOnlyChip = () => {
  return (
    <Chip
      className={css.readOnlyChip}
      variant="outlined"
      size="small"
      icon={<VisibilityIcon className={css.visibilityIcon} />}
      label={
        <Typography variant="caption" display="flex" alignItems="center" gap={0.5}>
          Read-only
        </Typography>
      }
    />
  )
}
