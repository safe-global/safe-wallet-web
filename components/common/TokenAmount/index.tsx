import { TransferDirection } from '@gnosis.pm/safe-react-gateway-sdk'
import { ReactElement, useState } from 'react'
import { formatDecimals } from 'services/formatters'
import css from './styles.module.css'

export const TokenIcon = (props: { logoUri?: string | null; tokenSymbol?: string | null }): ReactElement | null => {
  const [src, setSrc] = useState<string>(props.logoUri || '')

  return src ? (
    <img src={src} alt={props.tokenSymbol || ''} onError={() => setSrc('')} className={css.tokenIcon} />
  ) : null
}

const TokenAmount = (props: {
  value: string
  decimals?: number | null
  logoUri?: string | null
  tokenSymbol?: string | null
  direction?: TransferDirection
}): ReactElement => {
  const sign = props.direction === TransferDirection.OUTGOING ? '-' : ''

  return (
    <span className={css.container}>
      <TokenIcon logoUri={props.logoUri} tokenSymbol={props.tokenSymbol} />
      {sign}
      {formatDecimals(props.value, props.decimals || undefined)} {props.tokenSymbol}
    </span>
  )
}

export default TokenAmount
