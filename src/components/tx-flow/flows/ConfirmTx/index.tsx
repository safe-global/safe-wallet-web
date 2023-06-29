import type { TransactionSummary } from '@safe-global/safe-gateway-typescript-sdk'
import TxLayout from '@/components/tx-flow/common/TxLayout'
import ConfirmProposedTx from './ConfirmProposedTx'
import { useTransactionType } from '@/hooks/useTransactionType'
import TxInfo from '@/components/transactions/TxInfo'

const ConfirmTxFlow = ({ txSummary }: { txSummary: TransactionSummary }) => {
  const { text } = useTransactionType(txSummary)

  return (
    <TxLayout
      title="Confirm transaction"
      subtitle={
        <>
          {text}&nbsp;
          <TxInfo info={txSummary.txInfo} withLogo={false} omitSign />
        </>
      }
      step={0}
      txSummary={txSummary}
    >
      <ConfirmProposedTx txSummary={txSummary} />
    </TxLayout>
  )
}

export default ConfirmTxFlow
