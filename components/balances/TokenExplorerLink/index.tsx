import { type ReactElement } from 'react'
import { IconButton } from '@mui/material'
import { useCurrentChain } from '@/hooks/useChains'

const ExplorerLink = ({ address }: { address: string }): ReactElement | null => {
  const currentChain = useCurrentChain()
  const link = currentChain?.getExplorerLink(address)

  // Native token
  if (parseInt(address, 16) === 0) {
    return null
  }

  return (
    <a {...link} target="_blank" rel="noopener noreferrer">
      <IconButton>
        <img src="/images/link.svg" width={16} height={16} alt="Link" />
      </IconButton>
    </a>
  )
}

export default ExplorerLink
