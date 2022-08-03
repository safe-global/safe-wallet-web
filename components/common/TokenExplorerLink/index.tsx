import { type ReactElement } from 'react'
import { IconButton, Tooltip } from '@mui/material'
import { useCurrentChain } from '@/hooks/useChains'
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded'
import { getBlockExplorerLink } from '@/utils/chains'

const ExplorerLink = ({ address }: { address: string }): ReactElement | null => {
  const currentChain = useCurrentChain()
  const link = currentChain ? getBlockExplorerLink(currentChain, address) : undefined

  if (!link) return null

  return (
    <Tooltip title={link.title} placement="top">
      <IconButton href={link.href} target="_blank" rel="noopener noreferrer" size="small">
        <OpenInNewRoundedIcon fontSize="small" color="border" sx={{ width: '16px', height: '16px' }} />
      </IconButton>
    </Tooltip>
  )
}

export default ExplorerLink
