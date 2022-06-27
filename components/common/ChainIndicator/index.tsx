import { ReactElement, useMemo } from 'react'
import { useCurrentChain } from '@/hooks/useChains'
import { useAppSelector } from '@/store'
import { selectChainById } from '@/store/chainsSlice'
import css from './styles.module.css'

type ChainIndicatorProps = {
  chainId?: string
  inline?: boolean
}

const ChainIndicator = ({ chainId, inline = false }: ChainIndicatorProps): ReactElement => {
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
    <span style={style} className={inline ? css.inlineIndicator : css.indicator}>
      {chainConfig?.chainName || ' '}
    </span>
  )
}

export default ChainIndicator
