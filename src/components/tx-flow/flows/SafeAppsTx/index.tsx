import type { BaseTransaction, RequestId, SendTransactionRequestParams } from '@safe-global/safe-apps-sdk'
import TxLayout from '@/components/tx-flow/common/TxLayout'
import type { SafeAppData } from '@safe-global/safe-gateway-typescript-sdk'
import ReviewSafeAppsTx from './ReviewSafeAppsTx'
import { AppTitle } from '@/components/tx-flow/flows/SignMessage'

export type SafeAppsTxParams = {
  appId?: string
  app?: SafeAppData
  requestId: RequestId
  txs: BaseTransaction[]
  params?: SendTransactionRequestParams
}

const SafeAppsTxFlow = ({ data }: { data: SafeAppsTxParams }) => {
  return (
    <TxLayout
      title="Confirm transaction"
      subtitle={<AppTitle name={data.app?.name} logoUri={data.app?.iconUrl} />}
      step={0}
    >
      <ReviewSafeAppsTx safeAppsTx={data} />
    </TxLayout>
  )
}

export default SafeAppsTxFlow
