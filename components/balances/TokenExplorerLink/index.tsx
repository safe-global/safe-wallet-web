import { type ReactElement } from 'react'
import { IconButton, Tooltip } from '@mui/material'
import { useCurrentChain } from '@/hooks/useChains'

const ExplorerLink = ({ address }: { address: string }): ReactElement | null => {
  const currentChain = useCurrentChain()

  if (!currentChain) return null

  const link = currentChain.getExplorerLink(address)

  return (
    <Tooltip title={link.title} placement="top">
      <a href={link.href} target="_blank" rel="noopener noreferrer">
        <IconButton disableRipple sx={{ padding: 0, width: '24px', height: '24px' }}>
          <img src="/images/link.svg" width={16} height={16} alt="Link" />
        </IconButton>
      </a>
    </Tooltip>
  )
}

export default ExplorerLink
