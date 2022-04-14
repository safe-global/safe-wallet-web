import { ReactElement, useMemo } from 'react'
import useSafeAddress from 'services/useSafeAddress'
import { useAppSelector } from 'store'
import { selectChainById } from 'store/chainsSlice'

const ChainIndicator = (): ReactElement => {
  const { chainId } = useSafeAddress()
  const chainConfig = useAppSelector((state) => selectChainById(state, chainId))

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
