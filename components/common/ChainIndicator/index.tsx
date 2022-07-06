import { ReactElement, useMemo } from 'react'
import { useChainById } from '@/hooks/useChains'
import css from './styles.module.css'
import useChainId from '@/hooks/useChainId'

type ChainIndicatorProps = {
  chainId?: string
  inline?: boolean
}

const ChainIndicator = ({ chainId, inline = false }: ChainIndicatorProps): ReactElement => {
  const currentChainId = useChainId()
  const id = chainId || currentChainId
  const chainConfig = useChainById(id)

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
