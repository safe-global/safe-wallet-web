import type { TransactionSummary } from '@safe-global/safe-gateway-typescript-sdk'
import TxLayout from '@/components/tx-flow/common/TxLayout'
import ConfirmProposedTx from './ConfirmProposedTx'

const ConfirmTxFlow = ({ txSummary }: { txSummary: TransactionSummary }) => {
  return (
    <TxLayout title="Confirm transaction" step={0} txSummary={txSummary}>
      <ConfirmProposedTx txSummary={txSummary} />
    </TxLayout>
  )
}

export default ConfirmTxFlow
