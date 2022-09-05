import { ReactElement, useMemo } from 'react'
import { BigNumber } from 'ethers'
import { Box } from '@mui/system'
import { DecodedDataResponse, getDecodedData, Operation } from '@gnosis.pm/safe-react-gateway-sdk'
import { MetaTransactionData, OperationType, SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'
import {
  encodeMultiSendData,
  standardizeMetaTransactionData,
} from '@gnosis.pm/safe-core-sdk/dist/src/utils/transactions/utils'
import SendFromBlock from '@/components/tx/SendFromBlock'
import Multisend from '@/components/transactions/TxDetails/TxData/DecodedData/Multisend'
import { InfoDetails } from '@/components/transactions/InfoDetails'
import EthHashInfo from '@/components/common/EthHashInfo'
import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import useAsync from '@/hooks/useAsync'
import useChainId from '@/hooks/useChainId'
import useSafeInfo from '@/hooks/useSafeInfo'
import {
  getMultiSendCallOnlyContractAddress,
  getMultiSendCallOnlyContractInstance,
} from '@/services/contracts/safeContracts'
import { createTx } from '@/services/tx/txSender'
import { SafeAppsTxParams } from '.'
import { useCurrentChain } from '@/hooks/useChains'
import { formatVisualAmount } from '@/utils/formatters'

const parseTxValue = (value: string | number): string => {
  if (!value) return ''

  return BigNumber.from(value).toString()
}

type ReviewSafeAppsTxProps = {
  onSubmit: (data: null) => void
  safeAppsTx: SafeAppsTxParams
}

const ReviewSafeAppsTx = ({
  onSubmit,
  safeAppsTx: { app, txs, requestId, params },
}: ReviewSafeAppsTxProps): ReactElement => {
  const isMultiSend = txs.length > 1
  const chainId = useChainId()
  const chain = useCurrentChain()
  const { decimals, symbol } = chain!.nativeCurrency
  const { safe } = useSafeInfo()

  const multiSendContract = useMemo(() => {
    if (!chainId) return

    return getMultiSendCallOnlyContractInstance(chainId, safe.version)
  }, [chainId, safe])

  const txRecipient: string | undefined = useMemo(
    () => (isMultiSend ? getMultiSendCallOnlyContractAddress(chainId) : txs[0]?.to),
    [isMultiSend, chainId, txs],
  )

  const txData: string | undefined = useMemo(() => {
    if (!txs || (txs && !txs.length)) return

    if (!isMultiSend) {
      return txs[0].data
    }

    const standardizeTxs = txs.map((tx) => standardizeMetaTransactionData(tx))

    const encodedData = multiSendContract?.encode('multiSend', [encodeMultiSendData(standardizeTxs)])

    return encodedData
  }, [txs, multiSendContract, isMultiSend])

  const txValue: string | undefined = useMemo(
    () => (isMultiSend ? '0' : parseTxValue(txs[0]?.value)),
    [txs, isMultiSend],
  )

  const operation = useMemo(() => (isMultiSend ? Operation.DELEGATE : Operation.CALL), [isMultiSend])

  const [decodedData, decodedDataError, decodedDataLoading] = useAsync<DecodedDataResponse>(() => {
    return new Promise((resolve, reject) => {
      if (!txData || (txData && isNaN(parseInt(txData, 16)))) {
        return reject()
      }

      getDecodedData(chainId, txData).then((result) => {
        console.log('getDecodedData', txData, result)
        return resolve(result)
      })
    })
  }, [txData])

  const [safeTx, safeTxError] = useAsync<SafeTransaction>(() => {
    if (txRecipient && txData && operation !== undefined) {
      const txParams: MetaTransactionData = {
        to: txRecipient,
        value: txValue,
        data: txData,
        operation: operation as unknown as OperationType,
      }

      return createTx(txParams)
    }
  }, [txRecipient])

  return (
    <SignOrExecuteForm
      safeTx={safeTx}
      isExecutable={safe.threshold === 1}
      onSubmit={onSubmit}
      requestId={requestId}
      error={safeTxError}
    >
      <Box py={2}>
        <SendFromBlock />

        <InfoDetails
          title={`Interact with${
            Number(txValue) !== 0 ? ` (and send ${formatVisualAmount(txValue, decimals)} ${symbol} to)` : ''
          }:`}
        >
          <EthHashInfo address={txRecipient || ''} shortAddress={false} showCopyButton hasExplorer />
        </InfoDetails>

        {isMultiSend && (
          <Multisend
            txData={{
              dataDecoded: decodedData,
              to: { value: txRecipient || '' },
              value: txValue,
              operation,
              trustedDelegateCallTarget: false,
            }}
          />
        )}
      </Box>
    </SignOrExecuteForm>
  )
}

export default ReviewSafeAppsTx
