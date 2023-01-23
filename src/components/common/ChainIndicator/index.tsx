import type { ReactElement } from 'react'
import { useMemo } from 'react'
import classnames from 'classnames'
import { useAppSelector } from '@/store'
import { selectChainById } from '@/store/chainsSlice'
import css from './styles.module.css'
import useChainId from '@/hooks/useChainId'
import { Skeleton } from '@mui/material'

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

  return chainConfig?.chainName ? (
    <span style={style} className={classnames(inline ? css.inlineIndicator : css.indicator, className)}>
      {chainConfig.chainName}
    </span>
  ) : (
    <Skeleton width="100%" height="22px" variant="rectangular" sx={{ flexShrink: 0 }} />
  )
}

export default ChainIndicator
