import { type ReactElement } from 'react'
import { IconButton, Tooltip } from '@mui/material'
import { useCurrentChain } from '@/hooks/useChains'
import css from './styles.module.css'

const ExplorerLink = ({ address }: { address: string }): ReactElement | null => {
  const currentChain = useCurrentChain()

  if (!currentChain) return null

  const link = currentChain.getExplorerLink(address)

  return (
    <Tooltip title={link.title} placement="top">
      <IconButton
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        disableRipple
        sx={{ padding: 0 }}
        className={css.linkButton}
      >
        <img src="/images/link.svg" width={16} height={16} alt="Link" />
      </IconButton>
    </Tooltip>
  )
}

export default ExplorerLink
