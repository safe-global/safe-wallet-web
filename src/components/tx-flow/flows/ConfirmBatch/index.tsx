import { type ReactElement, useContext, useEffect } from 'react'
import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import { createMultiSendCallOnlyTx } from '@/services/tx/tx-sender'
import { SafeTxContext } from '../../SafeTxProvider'
import type { MetaTransactionData } from '@safe-global/safe-core-sdk-types'
import TxLayout from '../../common/TxLayout'
import BatchIcon from '@/public/images/common/batch.svg'

type ConfirmBatchProps = {
  calls: MetaTransactionData[]
  onSubmit: () => void
}

const ConfirmBatch = ({ calls, onSubmit }: ConfirmBatchProps): ReactElement => {
  const { setSafeTx, setSafeTxError } = useContext(SafeTxContext)

  useEffect(() => {
    createMultiSendCallOnlyTx(calls).then(setSafeTx).catch(setSafeTxError)
  }, [calls, setSafeTx, setSafeTxError])

  return <SignOrExecuteForm onSubmit={onSubmit} isBatch />
}

const ConfirmBatchFlow = (props: ConfirmBatchProps) => {
  return (
    <TxLayout
      title="Confirm batch"
      subtitle={`This batch contains ${props.calls.length} transactions`}
      icon={BatchIcon}
      step={0}
    >
      <ConfirmBatch {...props} />
    </TxLayout>
  )
}

export default ConfirmBatchFlow
