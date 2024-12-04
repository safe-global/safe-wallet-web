import type { ReactElement, ComponentType, SyntheticEvent } from 'react'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import SvgIcon from '@mui/material/SvgIcon'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import LinkIcon from '@/public/images/common/link.svg'
import Link from 'next/link'

export type ExplorerButtonProps = {
  title?: string
  href?: string
  className?: string
  icon?: ComponentType
  onClick?: (e: SyntheticEvent) => void
  isCompact?: boolean
}

const ExplorerButton = ({
  title = '',
  href = '',
  icon = LinkIcon,
  className,
  onClick,
  isCompact = true,
}: ExplorerButtonProps): ReactElement => {
  return isCompact ? (
    <Tooltip title={title} placement="top">
      <IconButton
        data-testid="explorer-btn"
        className={className}
        target="_blank"
        rel="noreferrer"
        href={href}
        size="small"
        sx={{ color: 'inherit' }}
        onClick={onClick}
      >
        <SvgIcon component={icon} inheritViewBox fontSize="small" />
      </IconButton>
    </Tooltip>
  ) : (
    <Link
      data-testid="explorer-btn"
      className={className}
      target="_blank"
      rel="noreferrer"
      href={href}
      onClick={onClick}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Typography
          noWrap
          sx={{
            fontWeight: 700,
            fontSize: 'small',
            mr: 'var(--space-1)',
          }}
        >
          View on explorer
        </Typography>

        <SvgIcon component={icon} inheritViewBox fontSize="small" />
      </Box>
    </Link>
  )
}

export default ExplorerButton
