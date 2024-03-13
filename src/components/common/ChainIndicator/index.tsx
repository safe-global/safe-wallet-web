import type { ReactElement } from 'react'
import { useMemo } from 'react'
import classnames from 'classnames'
import { useAppSelector } from '@/store'
import { selectChainById, selectChains } from '@/store/chainsSlice'
import css from './styles.module.css'
import useChainId from '@/hooks/useChainId'
import { Skeleton } from '@mui/material'
import isEmpty from 'lodash/isEmpty'

type ChainIndicatorProps = {
  chainId?: string
  inline?: boolean
  className?: string
  showUnknown?: boolean
  showLogo?: boolean
  responsive?: boolean
}

const fallbackChainConfig = {
  chainName: 'Unknown chain',
  chainId: '-1',
  theme: {
    backgroundColor: '#ddd',
    textColor: '#000',
  },
  chainLogoUri: null,
}

const ChainIndicator = ({
  chainId,
  className,
  inline = false,
  showUnknown = true,
  showLogo = true,
  responsive = false,
}: ChainIndicatorProps): ReactElement | null => {
  const currentChainId = useChainId()
  const id = chainId || currentChainId
  const chains = useAppSelector(selectChains)
  const chainConfig =
    useAppSelector((state) => selectChainById(state, id)) || (showUnknown ? fallbackChainConfig : null)
  const noChains = isEmpty(chains.data)

  const style = useMemo(() => {
    if (!chainConfig) return
    const { theme } = chainConfig

    return {
      backgroundColor: theme.backgroundColor,
      color: theme.textColor,
    }
  }, [chainConfig])

  return noChains ? (
    <Skeleton width="100%" height="22px" variant="rectangular" sx={{ flexShrink: 0 }} />
  ) : chainConfig ? (
    <span
      data-testid="chain-logo"
      style={showLogo ? undefined : style}
      className={classnames(className || '', {
        [css.inlineIndicator]: inline,
        [css.indicator]: !inline,
        [css.withLogo]: showLogo,
        [css.responsive]: responsive,
      })}
    >
      {showLogo && (
        <img
          src={chainConfig.chainLogoUri ?? undefined}
          alt={`${chainConfig.chainName} Logo`}
          width={24}
          height={24}
          loading="lazy"
        />
      )}

      <span className={css.name}>{chainConfig.chainName}</span>
    </span>
  ) : null
}

export default ChainIndicator
