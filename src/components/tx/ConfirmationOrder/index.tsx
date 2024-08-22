import SwapOrderConfirmationView from '@/features/swap/components/SwapOrderConfirmationView'
import { isConfirmationViewOrder } from '@/utils/transaction-guards'
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
  if (isConfirmationViewOrder(decodedData)) {
    return <SwapOrderConfirmationView order={decodedData} settlementContract={toAddress} />
  }

  return <>{JSON.stringify(decodedData)}</>
}

export default ConfirmationOrder
