import { DecodedDataResponse, getDecodedData, Operation, TransactionDetails } from '@gnosis.pm/safe-react-gateway-sdk'
import { Box, Skeleton } from '@mui/material'
import useAsync from '@/hooks/useAsync'
import { OperationType, SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'
import useChainId from '@/hooks/useChainId'
import useSafeInfo from '@/hooks/useSafeInfo'
import extractTxInfo from '@/services/tx/extractTxInfo'
import { createMultiSendCallOnlyTx } from '@/services/tx/txSender'
import { isEmptyHexData } from '@/utils/hex'
import Multisend from '@/components/transactions/TxDetails/TxData/DecodedData/Multisend'
import { standardizeMetaTransactionData } from '@gnosis.pm/safe-core-sdk/dist/src/utils/transactions/utils'

const DecodedTxs = ({ txs, numberOfTxs }: { txs: TransactionDetails[] | undefined; numberOfTxs: number }) => {
  const chainId = useChainId()
  const { safeAddress } = useSafeInfo()

  const [safeTx, , safeTxLoading] = useAsync<SafeTransaction | undefined>(async () => {
    if (!txs) return

    const safeTxs = txs.map((txDetails) => extractTxInfo(txDetails, safeAddress).txParams)
    const baseTxs = safeTxs.map((tx) => standardizeMetaTransactionData(tx))
    return createMultiSendCallOnlyTx(baseTxs)
  }, [txs, safeAddress])

  const [decodedData, , decodedDataLoading] = useAsync<DecodedDataResponse | undefined>(async () => {
    if (!safeTx || isEmptyHexData(safeTx.data.data)) return

    return getDecodedData(chainId, safeTx.data.data)
  }, [chainId, safeTx])

  if (safeTxLoading || decodedDataLoading) {
    return (
      <Box display="flex" flexDirection="column" gap={1} my={1}>
        {Array.from(Array(numberOfTxs)).map((_, i) => (
          <Skeleton key={i} variant="rectangular" height={48} />
        ))}
      </Box>
    )
  }

  return safeTx ? (
    <Box py={1}>
      <Multisend
        txData={{
          dataDecoded: decodedData,
          to: { value: safeTx.data.to },
          value: safeTx.data.value,
          operation: safeTx.data.operation === OperationType.Call ? Operation.CALL : Operation.DELEGATE,
          trustedDelegateCallTarget: false,
        }}
      />
    </Box>
  ) : null
}

export default DecodedTxs
