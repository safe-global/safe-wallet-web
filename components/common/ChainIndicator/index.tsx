import { ReactElement, useMemo } from 'react'
import { useCurrentChain } from '@/services/useChains'

const ChainIndicator = (): ReactElement => {
  const chainConfig = useCurrentChain()

  const style = useMemo(() => {
    if (!chainConfig) return
    const { theme } = chainConfig

    return {
      backgroundColor: theme.backgroundColor,
      color: theme.textColor,
    }
  }, [chainConfig])

  return <div style={style}>{chainConfig?.chainName || ' '}</div>
}

export default ChainIndicator
