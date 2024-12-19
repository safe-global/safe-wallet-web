import type { BaseTransaction, RequestId, SendTransactionRequestParams } from '@safe-global/safe-apps-sdk'
import TxLayout from '@/components/tx-flow/common/TxLayout'
import type { SafeAppData } from '@safe-global/safe-gateway-typescript-sdk'
import ReviewSafeAppsTx from './ReviewSafeAppsTx'
import { AppTitle } from '@/components/tx-flow/flows/SignMessage'

export type SafeAppsTxParams = {
  appId?: string
  app?: Partial<SafeAppData>
  requestId: RequestId
  txs: BaseTransaction[]
  params?: SendTransactionRequestParams
}

const SafeAppsTxFlow = ({
  data,
  onSubmit,
}: {
  data: SafeAppsTxParams
  onSubmit?: (txId: string, safeTxHash: string) => void
}) => {
  return (
    <TxLayout
      title="Confirm transaction"
      subtitle={<AppTitle name={data.app?.name} logoUri={data.app?.iconUrl} txs={data.txs} />}
      step={0}
    >
      <ReviewSafeAppsTx safeAppsTx={data} onSubmit={onSubmit} />
    </TxLayout>
  )
}

export default SafeAppsTxFlow
