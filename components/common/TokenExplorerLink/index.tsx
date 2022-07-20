import { type ReactElement } from 'react'
import { IconButton, Tooltip } from '@mui/material'
import { useCurrentChain } from '@/hooks/useChains'

const ExplorerLink = ({ address }: { address: string }): ReactElement | null => {
  const currentChain = useCurrentChain()

  const link = currentChain?.getExplorerLink(address)

  if (!link) return null

  return (
    <Tooltip title={link.title} placement="top">
      <IconButton href={link.href} target="_blank" rel="noopener noreferrer" disableRipple size="small">
        <img src="/images/link.svg" width={16} height={16} alt="Link" />
      </IconButton>
    </Tooltip>
  )
}

export default ExplorerLink
