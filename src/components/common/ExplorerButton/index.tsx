import type { ReactElement, ComponentType, SyntheticEvent } from 'react'
import { IconButton, SvgIcon, Tooltip } from '@mui/material'
import LinkIcon from '@/public/images/common/link.svg'

export type ExplorerButtonProps = {
  title?: string
  href?: string
  className?: string
  icon?: ComponentType
  onClick?: (e: SyntheticEvent) => void
}

const ExplorerButton = ({
  title = '',
  href = '',
  icon = LinkIcon,
  className,
  onClick,
}: ExplorerButtonProps): ReactElement => (
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
)

export default ExplorerButton
