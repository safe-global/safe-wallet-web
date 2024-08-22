import SwapOrderConfirmationView from '@/features/swap/components/SwapOrderConfirmationView'
import { isAnySwapConfirmationViewOrder, isStakingConfirmationOrder } from '@/utils/transaction-guards'
import type {
  BaselineConfirmationView,
  OrderConfirmationView,
  DecodedDataResponse,
} from '@safe-global/safe-gateway-typescript-sdk'

type OrderConfirmationViewProps = {
  decodedData: DecodedDataResponse | BaselineConfirmationView | OrderConfirmationView
  toAddress: string
}

const ConfirmationOrder = ({ decodedData, toAddress }: OrderConfirmationViewProps) => {
  if (isAnySwapConfirmationViewOrder(decodedData)) {
    return <SwapOrderConfirmationView order={decodedData} settlementContract={toAddress} />
  }

  if (isStakingConfirmationOrder(decodedData)) {
    return <>{JSON.stringify(decodedData, null, 2)}</>
  }

  return <>{JSON.stringify(decodedData, null, 2)}</>
}

export default ConfirmationOrder
