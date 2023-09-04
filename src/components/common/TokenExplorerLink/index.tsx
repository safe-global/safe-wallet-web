import { type ReactElement } from 'react'
import { ExplorerButton } from '@safe-global/safe-react-components'

import { useCurrentChain } from '@/hooks/useChains'
import { getBlockExplorerLink } from '@/utils/chains'

const ExplorerLink = ({ address }: { address: string }): ReactElement | null => {
  const currentChain = useCurrentChain()
  const link = currentChain ? getBlockExplorerLink(currentChain, address) : undefined

  if (!link) return null

  return <ExplorerButton href={link.href} title={link.title} />
}

export default ExplorerLink
