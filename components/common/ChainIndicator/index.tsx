import { ReactElement, useMemo } from 'react'
import { useCurrentChain } from '@/services/useChains'
import { useAppSelector } from '@/store'
import { selectChainById } from '@/store/chainsSlice'

type ChainIndicatorProps = {
  chainId?: string
  className?: string
}

const ChainIndicator = ({ chainId, className }: ChainIndicatorProps): ReactElement => {
  const currentChain = useCurrentChain()
  const id = chainId || currentChain?.chainId || ''
  const chainConfig = useAppSelector((state) => selectChainById(state, id))

  const style = useMemo(() => {
    if (!chainConfig) return
    const { theme } = chainConfig

    return {
      backgroundColor: theme.backgroundColor,
      color: theme.textColor,
    }
  }, [chainConfig])

  return (
    <div style={style} className={className}>
      {chainConfig?.chainName || ' '}
    </div>
  )
}

export default ChainIndicator
