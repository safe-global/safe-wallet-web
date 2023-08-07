import type { ReactElement, ComponentType } from 'react'
import { IconButton, SvgIcon, Tooltip } from '@mui/material'
import LinkIcon from '@/public/images/common/link.svg'

export type ExplorerButtonProps = {
  title?: string
  href?: string
  className?: string
  icon?: ComponentType
}

const ExplorerButton = ({ title = '', href = '', icon = LinkIcon, className }: ExplorerButtonProps): ReactElement => (
  <Tooltip title={title} placement="top">
    <IconButton
      className={className}
      target="_blank"
      rel="noreferrer"
      href={href}
      size="small"
      sx={{ color: 'inherit' }}
    >
      <SvgIcon component={icon} inheritViewBox fontSize="small" />
    </IconButton>
  </Tooltip>
)

export default ExplorerButton
