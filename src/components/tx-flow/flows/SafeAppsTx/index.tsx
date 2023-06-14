import type { BaseTransaction, RequestId, SendTransactionRequestParams } from '@safe-global/safe-apps-sdk'
import TxLayout from '@/components/tx-flow/common/TxLayout'
import SafeAppsTxModalLabel from '@/components/safe-apps/SafeAppsModalLabel'
import type { SafeAppData } from '@safe-global/safe-gateway-typescript-sdk'
import ReviewSafeAppsTx from './ReviewSafeAppsTx'

export type SafeAppsTxParams = {
  appId?: string
  app?: SafeAppData
  requestId: RequestId
  txs: BaseTransaction[]
  params?: SendTransactionRequestParams
}

const SafeAppsTxFlow = ({ data }: { data: SafeAppsTxParams }) => {
  const title = <SafeAppsTxModalLabel app={data.app} />

  return (
    <TxLayout title={title} step={0}>
      <ReviewSafeAppsTx safeAppsTx={data} />
    </TxLayout>
  )
}

export default SafeAppsTxFlow
