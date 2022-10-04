import type { ReactElement } from 'react'
import { useMemo } from 'react'
import classnames from 'classnames'
import { useAppSelector } from '@/store'
import { selectChainById } from '@/store/chainsSlice'
import css from './styles.module.css'
import useChainId from '@/hooks/useChainId'

type ChainIndicatorProps = {
  chainId?: string
  inline?: boolean
  className?: string
  renderWhiteSpaceIfNoChain?: boolean
}

const ChainIndicator = ({
  chainId,
  className,
  inline = false,
  renderWhiteSpaceIfNoChain = true,
}: ChainIndicatorProps): ReactElement | null => {
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

  if (!chainConfig?.chainName && !renderWhiteSpaceIfNoChain) return null

  return (
    <span style={style} className={classnames(inline ? css.inlineIndicator : css.indicator, className)}>
      {chainConfig?.chainName || ' '}
    </span>
  )
}

export default ChainIndicator
