import { type ReactElement } from 'react'
import { type SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { Box, Typography } from '@mui/material'
import SendFromBlock from '../../SendFromBlock'
import SignOrExecuteForm from '../../SignOrExecuteForm'
import SendToBlock from '@/components/tx/SendToBlock'
import useAsync from '@/hooks/useAsync'
import { createNftTransferParams } from '@/services/tx/tokenTransferParams'
import { type NftTransferParams } from '.'
import useSafeAddress from '@/hooks/useSafeAddress'
import Multisend from '@/components/transactions/TxDetails/TxData/DecodedData/Multisend'
import type { DecodedDataResponse } from '@safe-global/safe-gateway-typescript-sdk'
import { getDecodedData, Operation } from '@safe-global/safe-gateway-typescript-sdk'
import useChainId from '@/hooks/useChainId'
import { createMultiSendCallOnlyTx, createTx } from '@/services/tx/tx-sender'

type ReviewNftBatchProps = {
  params: NftTransferParams
  onSubmit: () => void
}

const ReviewNftBatch = ({ params, onSubmit }: ReviewNftBatchProps): ReactElement => {
  const safeAddress = useSafeAddress()
  const chainId = useChainId()
  const { tokens } = params

  const [safeTx, safeTxError] = useAsync<SafeTransaction>(() => {
    const calls = tokens.map((token) => {
      return createNftTransferParams(safeAddress, params.recipient, token.id, token.address)
    })
    return calls.length > 1 ? createMultiSendCallOnlyTx(calls) : createTx(calls[0])
  }, [safeAddress, params])

  const [decodedData] = useAsync<DecodedDataResponse | undefined>(async () => {
    if (!safeTx) return
    return getDecodedData(chainId, safeTx.data.data)
  }, [safeTx, chainId])

  return (
    <SignOrExecuteForm safeTx={safeTx} onSubmit={onSubmit} error={safeTxError}>
      <SendFromBlock title={`Sending ${tokens.length} NFT${tokens.length > 1 ? 's' : ''} from`} />

      <SendToBlock address={params.recipient} title="To" />

      <Typography color="text.secondary" mb={1}>
        Batched transactions
      </Typography>

      {safeTx && tokens.length > 1 && (
        <Box display="flex" flexDirection="column" gap={1} mb={3}>
          <Multisend
            txData={{
              dataDecoded: decodedData,
              to: { value: safeTx.data.to },
              value: safeTx.data.value,
              operation: Operation.CALL,
              trustedDelegateCallTarget: false,
            }}
            variant="outlined"
          />
        </Box>
      )}
    </SignOrExecuteForm>
  )
}

export default ReviewNftBatch
