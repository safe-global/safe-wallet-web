import { type ReactElement } from 'react'
import { type SafeTransaction } from '@safe-global/safe-core-sdk-types'
import SendFromBlock from '../../SendFromBlock'
import SignOrExecuteForm from '../../SignOrExecuteForm'
import SendToBlock from '@/components/tx/SendToBlock'
import useAsync from '@/hooks/useAsync'
import { createNftTransferParams } from '@/services/tx/tokenTransferParams'
import { type NftTransferParams } from '.'
import useSafeAddress from '@/hooks/useSafeAddress'
import { createMultiSendCallOnlyTx, createTx } from '@/services/tx/tx-sender'

type ReviewNftBatchProps = {
  params: NftTransferParams
  onSubmit: () => void
}

const ReviewNftBatch = ({ params, onSubmit }: ReviewNftBatchProps): ReactElement => {
  const safeAddress = useSafeAddress()
  const { tokens } = params

  const [safeTx, safeTxError] = useAsync<SafeTransaction>(() => {
    const calls = tokens.map((token) => {
      return createNftTransferParams(safeAddress, params.recipient, token.id, token.address)
    })
    return calls.length > 1 ? createMultiSendCallOnlyTx(calls) : createTx(calls[0])
  }, [safeAddress, params])

  return (
    <SignOrExecuteForm safeTx={safeTx} onSubmit={onSubmit} error={safeTxError}>
      <SendFromBlock title={`Sending ${tokens.length} NFT${tokens.length > 1 ? 's' : ''} from`} />

      <SendToBlock address={params.recipient} title="To" />
    </SignOrExecuteForm>
  )
}

export default ReviewNftBatch
