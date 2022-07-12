import { type ReactElement } from 'react'
import { IconButton } from '@mui/material'
import { useCurrentChain } from '@/hooks/useChains'

const ExplorerLink = ({ address }: { address: string }): ReactElement => {
  const currentChain = useCurrentChain()
  const link = currentChain?.getExplorerLink(address)

  return (
    <a {...link} target="_blank" rel="noopener noreferrer">
      <IconButton disableRipple sx={{ padding: 0 }}>
        <img src="/images/link.svg" width={16} height={16} alt="Link" />
      </IconButton>
    </a>
  )
}

export default ExplorerLink
