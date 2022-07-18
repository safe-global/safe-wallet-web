import { useEffect, useState, type ReactElement } from 'react'
import { TransferDirection } from '@gnosis.pm/safe-react-gateway-sdk'
import { formatAmount } from '@/utils/formatNumber'
import css from './styles.module.css'
import { formatUnits } from 'ethers/lib/utils'

export const TokenIcon = (props: {
  logoUri?: string | null
  tokenSymbol?: string | null
  size?: number
}): ReactElement | null => {
  const DEFAULT_SIZE = 26
  const { logoUri, tokenSymbol, size = DEFAULT_SIZE } = props
  const [src, setSrc] = useState<string>(logoUri || '')

  useEffect(() => void setSrc(logoUri || ''), [logoUri])

  return !src ? null : (
    <img src={src} alt={tokenSymbol || ''} className={css.tokenIcon} onError={() => setSrc('')} height={size} />
  )
}

const TokenAmount = ({
  value,
  decimals,
  logoUri,
  tokenSymbol,
  direction,
}: {
  value: string
  decimals?: number | null
  // TODO: update CLIENT GW SDK to not allow null
  // see https://safe.global/safe-client-gateway/docs/routes/transactions/models/struct.Erc20Transfer.html
  // and https://safe.global/safe-client-gateway/docs/routes/transactions/models/struct.Erc721Transfer.html
  logoUri?: string | null
  tokenSymbol?: string | null
  direction?: TransferDirection
}): ReactElement => {
  const sign = direction === TransferDirection.OUTGOING ? '-' : ''
  const amount = decimals ? formatUnits(value, decimals) : value

  return (
    <span className={css.container}>
      {logoUri && <TokenIcon logoUri={logoUri} tokenSymbol={tokenSymbol} />}
      {sign}
      {formatAmount(amount)} {tokenSymbol}
    </span>
  )
}

export default TokenAmount
