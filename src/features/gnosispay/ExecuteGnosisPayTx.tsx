import TxCard from '@/components/tx-flow/common/TxCard'
import TxLayout from '@/components/tx-flow/common/TxLayout'
import GnosisPayExecutionForm from './GnosisPayExecutionForm'
import { type GnosisPayTxItem } from '@/store/gnosisPayTxsSlice'
import useAsync from '@/hooks/useAsync'
import { useContext, useEffect } from 'react'
import { SafeTxContext } from '@/components/tx-flow/SafeTxProvider'
import useDecodeTx from '@/hooks/useDecodeTx'
import DecodedTx from '@/components/tx/DecodedTx'
import { RedefineBalanceChanges } from '@/components/tx/security/redefine/RedefineBalanceChange'
import { createTx } from '@/services/tx/tx-sender'

const ExecuteGnosisPayModal = ({ gnosisPayTx }: { gnosisPayTx: GnosisPayTxItem }) => {
  const { safeTx, setSafeTx } = useContext(SafeTxContext)

  const [fakeSafeTx] = useAsync(() => {
    return createTx(gnosisPayTx.safeTxData)
  }, [gnosisPayTx])

  useEffect(() => {
    if (fakeSafeTx) {
      setSafeTx(fakeSafeTx)
    }
  }, [fakeSafeTx, setSafeTx])

  const [decodedData, decodedDataError, decodedDataLoading] = useDecodeTx(safeTx)
  return (
    <TxCard>
      <DecodedTx
        tx={safeTx}
        decodedData={decodedData}
        decodedDataError={decodedDataError}
        decodedDataLoading={decodedDataLoading}
      />

      <RedefineBalanceChanges />

      <GnosisPayExecutionForm queuedGnosisPayTx={gnosisPayTx} isExecutable onlyExecute />
    </TxCard>
  )
}

const ExecuteGnosisPayTx = ({ gnosisPayTx }: { gnosisPayTx: GnosisPayTxItem }) => {
  return (
    <TxLayout title="Execute Gnosis Pay transaction" step={0}>
      <ExecuteGnosisPayModal gnosisPayTx={gnosisPayTx} />
    </TxLayout>
  )
}

export default ExecuteGnosisPayTx
