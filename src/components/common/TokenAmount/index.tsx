import { type ReactElement } from 'react'
import { TransferDirection } from '@safe-global/safe-gateway-typescript-sdk'
import css from './styles.module.css'
import { formatVisualAmount } from '@/utils/formatters'
import TokenIcon from '../TokenIcon'
import classNames from 'classnames'
import txSummaryCss from '@/components/transactions/TxSummary/styles.module.css'

const TokenAmount = ({
  value,
  decimals,
  logoUri,
  tokenSymbol,
  direction,
  fallbackSrc,
  size,
}: {
  value: string
  decimals?: number
  logoUri?: string
  tokenSymbol?: string
  direction?: TransferDirection
  fallbackSrc?: string
  size?: number
}): ReactElement => {
  const sign = direction === TransferDirection.OUTGOING ? '-' : ''
  const amount = decimals ? formatVisualAmount(value, decimals) : value

  return (
    <span className={classNames(css.container, txSummaryCss.method, { [css.verticalAlign]: logoUri })}>
      {logoUri && <TokenIcon logoUri={logoUri} tokenSymbol={tokenSymbol} fallbackSrc={fallbackSrc} size={size} />}
      {sign}
      {amount} {tokenSymbol}
    </span>
  )
}

export default TokenAmount
