import { type ReactElement } from 'react'
import { TransferDirection } from '@safe-global/safe-gateway-typescript-sdk'
import css from './styles.module.css'
import { formatVisualAmount } from '@/utils/formatters'
import TokenIcon from '../TokenIcon'
import classNames from 'classnames'

const TokenAmount = ({
  value,
  decimals,
  logoUri,
  tokenSymbol,
  direction,
  fallbackSrc,
}: {
  value: string
  decimals?: number
  logoUri?: string
  tokenSymbol?: string
  direction?: TransferDirection
  fallbackSrc?: string
}): ReactElement => {
  const sign = direction === TransferDirection.OUTGOING ? '-' : ''
  const amount = decimals ? formatVisualAmount(value, decimals) : value

  return (
    <span className={classNames(css.container, { [css.verticalAlign]: logoUri })}>
      {logoUri && <TokenIcon logoUri={logoUri} tokenSymbol={tokenSymbol} fallbackSrc={fallbackSrc} />}
      {sign}
      {amount} {tokenSymbol}
    </span>
  )
}

export default TokenAmount
