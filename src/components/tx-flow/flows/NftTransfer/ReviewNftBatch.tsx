import { type ReactElement, useEffect, useContext } from 'react'
import SendToBlock from '@/components/tx/SendToBlock'
import { createNftTransferParams } from '@/services/tx/tokenTransferParams'
import { type NftTransferParams } from '.'
import useSafeAddress from '@/hooks/useSafeAddress'
import { createMultiSendCallOnlyTx, createTx } from '@/services/tx/tx-sender'
import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import SendFromBlock from '@/components/tx/SendFromBlock'
import { SafeTxContext } from '../../SafeTxProvider'

type ReviewNftBatchProps = {
  params: NftTransferParams
  onSubmit: () => void
}

const ReviewNftBatch = ({ params, onSubmit }: ReviewNftBatchProps): ReactElement => {
  const { setSafeTx, setSafeTxError, setNonce } = useContext(SafeTxContext)
  const safeAddress = useSafeAddress()
  const { tokens = [] } = params

  useEffect(() => {
    if (params.txNonce !== undefined) {
      setNonce(params.txNonce)
    }

    if (!safeAddress || !params.tokens) return

    const calls = params.tokens.map((token) => {
      return createNftTransferParams(safeAddress, params.recipient || '', token.id, token.address)
    })

    const promise = calls.length > 1 ? createMultiSendCallOnlyTx(calls) : createTx(calls[0])

    promise.then(setSafeTx).catch(setSafeTxError)
  }, [safeAddress, params, setSafeTx, setSafeTxError, setNonce])

  return (
    <SignOrExecuteForm onSubmit={onSubmit}>
      <SendFromBlock title={`Sending ${tokens.length} NFT${tokens.length > 1 ? 's' : ''} from`} />

      <SendToBlock address={params.recipient || ''} title="To" />
    </SignOrExecuteForm>
  )
}

export default ReviewNftBatch
