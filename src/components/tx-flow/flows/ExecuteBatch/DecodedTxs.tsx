import type { DataDecoded, TransactionDetails } from '@safe-global/safe-gateway-typescript-sdk'
import { Box } from '@mui/material'
import useSafeInfo from '@/hooks/useSafeInfo'
import extractTxInfo from '@/services/tx/extractTxInfo'
import { isCustomTxInfo, isNativeTokenTransfer, isTransferTxInfo } from '@/utils/transaction-guards'
import SingleTxDecoded from '@/components/transactions/TxDetails/TxData/DecodedData/SingleTxDecoded'

const DecodedTxs = ({ txs }: { txs: TransactionDetails[] | undefined }) => {
  const { safeAddress } = useSafeInfo()

  if (!txs) return null

  return (
    <Box mt={1} display="flex" flexDirection="column" gap={1}>
      {txs.map((transaction, idx) => {
        if (!transaction.txData) return null

        const { txParams } = extractTxInfo(transaction, safeAddress)

        let decodedDataParams: DataDecoded = {
          method: '',
          parameters: undefined,
        }

        if (isCustomTxInfo(transaction.txInfo) && transaction.txInfo.isCancellation) {
          decodedDataParams.method = 'On-chain rejection'
        }

        if (isTransferTxInfo(transaction.txInfo) && isNativeTokenTransfer(transaction.txInfo.transferInfo)) {
          decodedDataParams.method = 'transfer'
        }

        const dataDecoded = transaction.txData.dataDecoded || decodedDataParams

        return (
          <SingleTxDecoded
            key={transaction.txId}
            tx={{
              dataDecoded,
              data: txParams.data,
              value: txParams.value,
              to: txParams.to,
              operation: 0,
            }}
            txData={transaction.txData}
            actionTitle={`Action ${idx + 1}`}
            showDelegateCallWarning={false}
          />
        )
      })}
    </Box>
  )
}

export default DecodedTxs
