import { ReactElement, useMemo } from 'react'
import { useAppSelector } from '@/store'
import { selectChainById } from '@/store/chainsSlice'
import css from './styles.module.css'
import useChainId from '@/hooks/useChainId'

type ChainIndicatorProps = {
  chainId?: string
  inline?: boolean
}

const ChainIndicator = ({ chainId, inline = false }: ChainIndicatorProps): ReactElement => {
  const currentChainId = useChainId()
  const id = chainId || currentChainId
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
