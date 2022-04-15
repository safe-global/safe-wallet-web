import { TransferDirection } from '@gnosis.pm/safe-react-gateway-sdk'
import { ReactElement } from 'react'
import { formatDecimals } from 'services/formatters'
import css from './styles.module.css'

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
      {props.logoUri && <img src={props.logoUri} alt={props.tokenSymbol || ''} />}
      {sign}
      {formatDecimals(props.value, props.decimals || undefined)} {props.tokenSymbol}
    </span>
  )
}

export default TokenAmount
