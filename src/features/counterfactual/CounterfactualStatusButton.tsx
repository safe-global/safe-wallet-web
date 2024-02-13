import { Badge, IconButton, Tooltip } from '@mui/material'
import css from './styles.module.css'
import useSafeInfo from '@/hooks/useSafeInfo'
import SafeLogo from '@/public/images/logo-no-text.svg'

const CounterfactualStatusButton = () => {
  const { safe } = useSafeInfo()

  if (safe.deployed) return null

  return (
    <Tooltip placement="right" title="Safe Account is not activated" arrow>
      <Badge color="info" variant="dot" anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <IconButton className={css.statusButton} size="small" color="primary" disableRipple>
          <SafeLogo />
        </IconButton>
      </Badge>
    </Tooltip>
  )
}

export default CounterfactualStatusButton
