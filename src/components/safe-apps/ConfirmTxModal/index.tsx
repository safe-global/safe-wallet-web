import { ReactElement, useMemo } from 'react'
import { BaseTransaction, RequestId, SendTransactionRequestParams } from '@gnosis.pm/safe-apps-sdk'
import {
  DecodedDataParameterValue,
  DecodedDataResponse,
  getDecodedData,
  Operation,
  SafeAppData,
} from '@gnosis.pm/safe-react-gateway-sdk'
import { validateAddress } from '@/utils/validation'
import SendFromBlock from '@/components/tx/SendFromBlock'
import { Box } from '@mui/system'
import Multisend from '@/components/transactions/TxDetails/TxData/DecodedData/Multisend'
import useAsync from '@/hooks/useAsync'
import useChainId from '@/hooks/useChainId'
import {
  encodeMultiSendData,
  standardizeMetaTransactionData,
} from '@gnosis.pm/safe-core-sdk/dist/src/utils/transactions/utils'
import { BigNumber } from '@ethersproject/bignumber'
import {
  getMultiSendCallOnlyContractAddress,
  getMultiSendCallOnlyContractInstance,
} from '@/services/contracts/safeContracts'
import { InfoDetails } from '@/components/transactions/InfoDetails'
import EthHashInfo from '@/components/common/EthHashInfo'
import useSafeInfo from '@/hooks/useSafeInfo'
import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import { MetaTransactionData, OperationType, SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'
import { createTx } from '@/services/tx/txSender'
import { TxStepperProps } from '@/components/tx/TxStepper/useTxStepper'
import TxModal, { TxModalProps } from '@/components/tx/TxModal'

export type ConfirmTxModalProps = {
  app?: SafeAppData
  txs: BaseTransaction[]
  params?: SendTransactionRequestParams
  requestId: RequestId
  appId?: string
}

const isTxValid = (t: BaseTransaction): boolean => {
  if (!['string', 'number'].includes(typeof t.value)) {
    return false
  }

  if (typeof t.value === 'string' && !/^(0x)?[0-9a-f]+$/i.test(t.value)) {
    return false
  }

  const isAddressValid = validateAddress(t.to) === undefined
  return isAddressValid && !!t.data && typeof t.data === 'string'
}

export type DecodedTxDetailType = DecodedDataParameterValue | DecodedDataResponse | undefined

const parseTxValue = (value: string | number): string => {
  if (!value) return ''

  return BigNumber.from(value).toString()
}

const SafeAppsTxSteps: TxStepperProps['steps'] = [
  {
    label: 'Safe Apps transaction',
    render: (data, onSubmit) => <ConfirmSafeAppsTx onSubmit={onSubmit} safeAppsTx={data as ConfirmTxModalProps} />,
  },
]

export const ConfirmSafeAppsTxModal = (props: Omit<TxModalProps, 'steps'>) => {
  return <TxModal {...props} steps={SafeAppsTxSteps} />
}

type ConfirmProposedTxProps = {
  safeAppsTx: ConfirmTxModalProps
  onSubmit: (data: null) => void
}

export const ConfirmSafeAppsTx = ({
  onSubmit,
  safeAppsTx: { app, txs, requestId, params },
}: ConfirmProposedTxProps): ReactElement => {
  const isMultiSend = txs.length > 1
  const invalidTransactions = !txs.length || txs.some((t) => !isTxValid(t))
  const chainId = useChainId()
  const { safe } = useSafeInfo()

  const multiSendContract = useMemo(() => {
    if (!chainId) return
    return getMultiSendCallOnlyContractInstance(chainId)
  }, [chainId])

  const txRecipient: string | undefined = useMemo(
    () => (isMultiSend ? getMultiSendCallOnlyContractAddress(chainId) : txs[0]?.to),
    [isMultiSend, chainId, txs],
  )

  const txData: string | undefined = useMemo(() => {
    if (!txs || (txs && !txs.length)) return

    const standardizeTxs = txs.map((tx) => standardizeMetaTransactionData(tx))

    const encodedData = multiSendContract?.interface.encodeFunctionData('multiSend', [
      encodeMultiSendData(standardizeTxs),
    ])

    return isMultiSend ? encodedData : txs[0]?.data
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
    if (txRecipient && txData && operation) {
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
    <SignOrExecuteForm safeTx={safeTx} isExecutable={safe.threshold === 1} onSubmit={onSubmit} error={safeTxError}>
      {invalidTransactions ? (
        <p>Error</p>
      ) : (
        // <SafeAppLoadError  />
        <Box py={2}>
          <SendFromBlock />

          <InfoDetails title="Interact with:">
            <EthHashInfo address={txRecipient || ''} shortAddress={false} showCopyButton hasExplorer />
          </InfoDetails>

          <Multisend
            txData={{
              dataDecoded: decodedData,
              to: { value: txRecipient || '' },
              value: txValue,
              operation,
              trustedDelegateCallTarget: false,
            }}
          />
        </Box>
      )}
    </SignOrExecuteForm>
  )
}
