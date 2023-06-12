import { type ReactElement, useEffect, useContext } from 'react'
import { DialogContent } from '@mui/material'
import SendToBlock from '@/components/tx/SendToBlock'
import { createNftTransferParams } from '@/services/tx/tokenTransferParams'
import type { SubmittedNftTransferParams } from '.'
import useSafeAddress from '@/hooks/useSafeAddress'
import { createMultiSendCallOnlyTx, createTx } from '@/services/tx/tx-sender'
import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import SendFromBlock from '@/components/tx/SendFromBlock'
import { SafeTxContext } from '../../SafeTxProvider'

type ReviewNftBatchProps = {
  params: SubmittedNftTransferParams
  onSubmit: () => void
  txNonce?: number
}

const ReviewNftBatch = ({ params, onSubmit, txNonce }: ReviewNftBatchProps): ReactElement => {
  const { setSafeTx, setSafeTxError, setNonce } = useContext(SafeTxContext)
  const safeAddress = useSafeAddress()
  const { tokens } = params

  useEffect(() => {
    if (txNonce !== undefined) {
      setNonce(txNonce)
    }
  }, [txNonce, setNonce])

  useEffect(() => {
    if (!safeAddress) return

    const calls = params.tokens.map((token) => {
      return createNftTransferParams(safeAddress, params.recipient, token.id, token.address)
    })

    const promise = calls.length > 1 ? createMultiSendCallOnlyTx(calls) : createTx(calls[0])

    promise.then(setSafeTx).catch(setSafeTxError)
  }, [safeAddress, params, setSafeTx, setSafeTxError])

  return (
    <DialogContent>
      <SignOrExecuteForm onSubmit={onSubmit}>
        <SendFromBlock title={`Sending ${tokens.length} NFT${tokens.length > 1 ? 's' : ''} from`} />

        <SendToBlock address={params.recipient || ''} title="To" />
      </SignOrExecuteForm>
    </DialogContent>
  )
}

export default ReviewNftBatch
