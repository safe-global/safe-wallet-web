import { type ReactElement } from 'react'
import { TransferDirection } from '@gnosis.pm/safe-react-gateway-sdk'
import css from './styles.module.css'
import { formatVisualAmount } from '@/utils/formatters'
import TokenIcon from '../TokenIcon'

const TokenAmount = ({
  value,
  decimals,
  logoUri,
  tokenSymbol,
  direction,
}: {
  value: string
  decimals?: number
  logoUri?: string
  tokenSymbol?: string
  direction?: TransferDirection
}): ReactElement => {
  const sign = direction === TransferDirection.OUTGOING ? '-' : ''
  const amount = decimals ? formatVisualAmount(value, decimals) : value

  return (
    <span className={css.container}>
      {logoUri && <TokenIcon logoUri={logoUri} tokenSymbol={tokenSymbol} />}

      <span>
        {sign}
        {amount} <span className={css.symbol}>{tokenSymbol}</span>
      </span>
    </span>
  )
}

export default TokenAmount
