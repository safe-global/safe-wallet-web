import { useEffect, useState, type ReactElement } from 'react'
import { TransferDirection } from '@gnosis.pm/safe-react-gateway-sdk'
import { formatAmount, formatDecimals } from '@/utils/formatters'
import css from './styles.module.css'

export const TokenIcon = (props: { logoUri?: string | null; tokenSymbol?: string | null }): ReactElement | null => {
  const { logoUri, tokenSymbol } = props
  const [src, setSrc] = useState<string>(logoUri || '')

  useEffect(() => void setSrc(logoUri || ''), [logoUri])

  return src ? <img src={src} alt={tokenSymbol || ''} className={css.tokenIcon} onError={() => setSrc('')} /> : null
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
  const wholeNumber = formatDecimals(props.value, props.decimals || undefined)

  return (
    <span className={css.container}>
      {props.logoUri && <TokenIcon logoUri={props.logoUri} tokenSymbol={props.tokenSymbol} />}
      {sign}
      {formatAmount(wholeNumber)} {props.tokenSymbol}
    </span>
  )
}

export default TokenAmount
