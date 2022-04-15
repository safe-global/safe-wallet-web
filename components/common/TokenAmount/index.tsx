import { TransferDirection } from '@gnosis.pm/safe-react-gateway-sdk'
import { ReactElement, useState } from 'react'
import { formatDecimals } from 'services/formatters'
import css from './styles.module.css'

const TokenAmount = (props: {
  value: string
  decimals?: number | null
  logoUri?: string | null
  tokenSymbol?: string | null
  direction?: TransferDirection
}): ReactElement => {
  const [src, setSrc] = useState<string>(props.logoUri || '')
  const sign = props.direction === TransferDirection.OUTGOING ? '-' : ''

  return (
    <span className={css.container}>
      {src && <img src={src} alt={props.tokenSymbol || ''} onError={() => setSrc('')} />}
      {sign}
      {formatDecimals(props.value, props.decimals || undefined)} {props.tokenSymbol}
    </span>
  )
}

export default TokenAmount
