import { type ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { formatVisualAmount } from '@/utils/formatters'
import { Skeleton } from '@mui/material'

const WalletBalance = ({ chainInfo, balance }: { chainInfo: ChainInfo | undefined; balance: BigInt | undefined }) => {
  if (!balance) {
    return <Skeleton width={30} />
  }

  return (
    <>
      {formatVisualAmount(balance.toString(10), chainInfo?.nativeCurrency.decimals ?? 18)}{' '}
      {chainInfo?.nativeCurrency.symbol ?? 'ETH'}
    </>
  )
}

export default WalletBalance
