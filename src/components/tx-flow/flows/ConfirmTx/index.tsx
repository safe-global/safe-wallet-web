import { isSwapTxInfo } from '@/utils/transaction-guards'
import type { TransactionSummary } from '@safe-global/safe-gateway-typescript-sdk'
import TxLayout from '@/components/tx-flow/common/TxLayout'
import ConfirmProposedTx from './ConfirmProposedTx'
import { useTransactionType } from '@/hooks/useTransactionType'
import TxInfo from '@/components/transactions/TxInfo'
import SwapIcon from '@/public/images/common/swap.svg'

const ConfirmTxFlow = ({ txSummary }: { txSummary: TransactionSummary }) => {
  const { text } = useTransactionType(txSummary)
  const isSwapOrder = isSwapTxInfo(txSummary.txInfo)

  return (
    <TxLayout
      title="Confirm transaction"
      subtitle={
        <>
          {text}&nbsp;
          {!isSwapOrder && <TxInfo info={txSummary.txInfo} withLogo={false} omitSign />}
        </>
      }
      icon={isSwapOrder && SwapIcon}
      step={0}
      txSummary={txSummary}
    >
      <ConfirmProposedTx txSummary={txSummary} />
    </TxLayout>
  )
}

export default ConfirmTxFlow
