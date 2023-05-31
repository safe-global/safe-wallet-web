import type { ReactElement } from 'react'
import { Typography } from '@mui/material'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'

import useAsync from '@/hooks/useAsync'
import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import { createRejectTx } from '@/services/tx/tx-sender'
import TxLayout from '@/components/TxFlow/common/TxLayout'
import { useContext, useEffect } from 'react'
import { SafeTxContext } from '@/components/TxFlow/SafeTxProvider'

type RejectTxProps = {
  txNonce: number
}

const RejectTx = ({ txNonce }: RejectTxProps): ReactElement => {
  const { setSafeTx, setSafeTxError, setNonce } = useContext(SafeTxContext)

  const [rejectTx, rejectError] = useAsync<SafeTransaction>(() => {
    return createRejectTx(txNonce)
  }, [txNonce])

  // It is necessary to set the replacement nonce otherwise it will use the recommended nonce
  useEffect(() => {
    setNonce(txNonce)
  }, [setNonce, txNonce])

  useEffect(() => {
    if (!rejectTx) return

    setSafeTx(rejectTx)
    setSafeTxError(rejectError)
  }, [rejectError, rejectTx, setSafeTx, setSafeTxError])

  return (
    <TxLayout title="Reject transaction">
      <>
        <Typography mb={2}>
          To reject the transaction, a separate rejection transaction will be created to replace the original one.
        </Typography>

        <Typography mb={2}>
          Transaction nonce: <b>{txNonce}</b>
        </Typography>

        <Typography mb={2}>
          You will need to confirm the rejection transaction with your currently connected wallet.
        </Typography>

        <SignOrExecuteForm onSubmit={() => {}} />
      </>
    </TxLayout>
  )
}

export default RejectTx
