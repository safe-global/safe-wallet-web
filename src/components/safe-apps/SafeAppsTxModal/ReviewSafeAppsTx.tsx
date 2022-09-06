import { ReactElement } from 'react'
import { DecodedDataResponse, getDecodedData, Operation } from '@gnosis.pm/safe-react-gateway-sdk'
import { OperationType, SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'
import SendFromBlock from '@/components/tx/SendFromBlock'
import Multisend from '@/components/transactions/TxDetails/TxData/DecodedData/Multisend'
import { InfoDetails } from '@/components/transactions/InfoDetails'
import EthHashInfo from '@/components/common/EthHashInfo'
import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import useAsync from '@/hooks/useAsync'
import useChainId from '@/hooks/useChainId'
import useSafeInfo from '@/hooks/useSafeInfo'
import { createMultiSendCallOnlyTx } from '@/services/tx/txSender'
import { SafeAppsTxParams } from '.'
import { useCurrentChain } from '@/hooks/useChains'
import { formatVisualAmount } from '@/utils/formatters'
import { Box } from '@mui/material'

type ReviewSafeAppsTxProps = {
  onSubmit: (data: null) => void
  safeAppsTx: SafeAppsTxParams
}

const ReviewSafeAppsTx = ({ onSubmit, safeAppsTx: { txs, requestId } }: ReviewSafeAppsTxProps): ReactElement => {
  const isMultiSend = txs.length > 1
  const chainId = useChainId()
  const chain = useCurrentChain()
  const { decimals, symbol } = chain!.nativeCurrency
  const { safe } = useSafeInfo()

  const [safeTx, safeTxError] = useAsync<SafeTransaction>(() => {
    return createMultiSendCallOnlyTx(txs)
  }, [])

  const [decodedData] = useAsync<DecodedDataResponse>(() => {
    return new Promise((resolve, reject) => {
      if (!safeTx || (safeTx.data.data && safeTx.data.data && isNaN(parseInt(safeTx.data.data, 16)))) {
        return reject()
      }

      getDecodedData(chainId, safeTx.data.data).then((result) => {
        return resolve(result)
      })
    })
  }, [safeTx])

  return (
    <SignOrExecuteForm
      safeTx={safeTx}
      isExecutable={safe.threshold === 1}
      onSubmit={onSubmit}
      requestId={requestId}
      error={safeTxError}
    >
      <>
        <SendFromBlock />

        <InfoDetails
          title={`Interact with${
            Number(safeTx?.data.value) !== 0
              ? ` (and send ${formatVisualAmount(safeTx?.data.value || 0, decimals)} ${symbol} to)`
              : ''
          }:`}
        >
          <EthHashInfo address={safeTx?.data.to || ''} shortAddress={false} showCopyButton hasExplorer />
        </InfoDetails>

        {isMultiSend && safeTx && (
          <Box py={1}>
            <Multisend
              txData={{
                dataDecoded: decodedData,
                to: { value: safeTx.data.to || '' },
                value: safeTx.data.value,
                operation: safeTx.data.operation === OperationType.Call ? Operation.CALL : Operation.DELEGATE,
                trustedDelegateCallTarget: false,
              }}
            />
          </Box>
        )}
      </>
    </SignOrExecuteForm>
  )
}

export default ReviewSafeAppsTx
