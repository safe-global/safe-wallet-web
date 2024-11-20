import SwapOrderConfirmation from '@/features/swap/components/SwapOrderConfirmationView'
import type { AnySwapOrderConfirmationView } from '@safe-global/safe-gateway-typescript-sdk'
import type { NarrowConfirmationViewProps } from '../types'

interface SwapOrderProps extends NarrowConfirmationViewProps {}

function SwapOrder({ txDetails, txInfo }: SwapOrderProps) {
  return (
    <SwapOrderConfirmation
      order={txInfo as unknown as AnySwapOrderConfirmationView}
      settlementContract={txDetails?.txData?.to?.value ?? ''}
    />
  )
}

export default SwapOrder
