import { type ReactElement } from 'react'
import { TransferDirection } from '@gnosis.pm/safe-react-gateway-sdk'
import { formatDecimals } from '@/utils/formatters'
import css from './styles.module.css'

export const TokenIcon = (props: { logoUri?: string | null; tokenSymbol?: string | null }): ReactElement | null => {
  const src = props.logoUri
  return src ? <img src={src} alt={props.tokenSymbol || ''} className={css.tokenIcon} /> : null
}

const TokenAmount = (props: {
  value: string
  decimals?: number | null
  // TODO: update CLIENT GW SDK to not allow null
  // see https://safe.global/safe-client-gateway/docs/routes/transactions/models/struct.Erc20Transfer.html
  // and https://safe.global/safe-client-gateway/docs/routes/transactions/models/struct.Erc721Transfer.html
  logoUri?: string | null
  tokenSymbol?: string | null
  direction?: TransferDirection
}): ReactElement => {
  const sign = props.direction === TransferDirection.OUTGOING ? '-' : ''

  return (
    <span className={css.container}>
      {props.logoUri && <TokenIcon logoUri={props.logoUri} tokenSymbol={props.tokenSymbol} />}
      {sign}
      {formatDecimals(props.value, props.decimals || undefined)} {props.tokenSymbol}
    </span>
  )
}

export default TokenAmount
