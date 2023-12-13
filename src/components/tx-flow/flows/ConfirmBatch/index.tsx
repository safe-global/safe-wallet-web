import { type ReactElement, useContext, useEffect } from 'react'
import { type TransactionDetails } from '@safe-global/safe-gateway-typescript-sdk'
import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import { createMultiSendCallOnlyTx } from '@/services/tx/tx-sender'
import { SafeTxContext } from '../../SafeTxProvider'
import type { MetaTransactionData } from '@safe-global/safe-core-sdk-types'
import { OperationType } from '@safe-global/safe-core-sdk-types'
import TxLayout from '../../common/TxLayout'
import BatchIcon from '@/public/images/common/batch.svg'
import { useDraftBatch } from '@/hooks/useDraftBatch'
import BatchTxList from '@/components/batch/BatchSidebar/BatchTxList'

type ConfirmBatchProps = {
  onSubmit: () => void
}

const getData = (txDetails: TransactionDetails): MetaTransactionData => {
  return {
    to: txDetails.txData?.to.value ?? '',
    value: txDetails.txData?.value ?? '0',
    data: txDetails.txData?.hexData ?? '0x',
    operation: OperationType.Call, // only calls can be batched
  }
}

const ConfirmBatch = ({ onSubmit }: ConfirmBatchProps): ReactElement => {
  const { setSafeTx, setSafeTxError } = useContext(SafeTxContext)
  const batchTxs = useDraftBatch()

  useEffect(() => {
    const calls = batchTxs.map((tx) => getData(tx.txDetails))
    createMultiSendCallOnlyTx(calls).then(setSafeTx).catch(setSafeTxError)
  }, [batchTxs, setSafeTx, setSafeTxError])

  return (
    <SignOrExecuteForm onSubmit={onSubmit} isBatch>
      <BatchTxList txItems={batchTxs} />
    </SignOrExecuteForm>
  )
}

const ConfirmBatchFlow = (props: ConfirmBatchProps) => {
  const { length } = useDraftBatch()

  return (
    <TxLayout
      title="Confirm batch"
      subtitle={`This batch contains ${length} transaction${length > 1 ? 's' : ''}`}
      icon={BatchIcon}
      step={0}
      isBatch
    >
      <ConfirmBatch {...props} />
    </TxLayout>
  )
}

export default ConfirmBatchFlow
