import StrakingConfirmationTx from '@/features/stake/components/StakingConfirmationTx'
import SwapOrderConfirmationView from '@/features/swap/components/SwapOrderConfirmationView'
import type useDecodeTx from '@/hooks/useDecodeTx'
import { isAnyStakingConfirmationView, isAnySwapConfirmationViewOrder } from '@/utils/transaction-guards'

type OrderConfirmationViewProps = {
  decodedData: ReturnType<typeof useDecodeTx>[0]
  toAddress: string
}

const ConfirmationOrder = ({ decodedData, toAddress }: OrderConfirmationViewProps) => {
  if (isAnySwapConfirmationViewOrder(decodedData)) {
    return <SwapOrderConfirmationView order={decodedData} settlementContract={toAddress} />
  }

  if (isAnyStakingConfirmationView(decodedData)) {
    return <StrakingConfirmationTx order={decodedData} />
  }

  return null
}

export default ConfirmationOrder
