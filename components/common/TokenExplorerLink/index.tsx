import { type ReactElement } from 'react'
import { IconButton, Tooltip } from '@mui/material'
import { useCurrentChain } from '@/hooks/useChains'
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded'

const ExplorerLink = ({ address }: { address: string }): ReactElement | null => {
  const currentChain = useCurrentChain()

  if (!currentChain) return null

  const link = currentChain.getExplorerLink(address)

  return (
    <Tooltip title={link.title} placement="top">
      <IconButton href={link.href} target="_blank" rel="noopener noreferrer" disableRipple size="small">
        <OpenInNewRoundedIcon
          fontSize="small"
          sx={({ palette }) => ({
            color: `${palette.border.main}`,
          })}
        />
      </IconButton>
    </Tooltip>
  )
}

export default ExplorerLink
