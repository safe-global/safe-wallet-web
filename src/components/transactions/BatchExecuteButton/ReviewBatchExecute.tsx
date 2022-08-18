import { BatchExecuteData } from '@/components/transactions/BatchExecuteButton/index'
import CodeIcon from '@mui/icons-material/Code'
import useAsync from '@/hooks/useAsync'
import {
  ChainInfo,
  DecodedDataBasicParameter,
  DecodedDataResponse,
  Erc20Transfer,
  Erc721Transfer,
  getDecodedData,
  getTransactionDetails,
  MultisigConfirmation,
  Operation,
  Transaction,
  TransactionDetails,
  TransactionInfo,
  TransactionTokenType,
} from '@gnosis.pm/safe-react-gateway-sdk'
import { getGnosisSafeContractInstance, getMultiSendCallOnlyContractInstance } from '@/services/contracts/safeContracts'
import { useCurrentChain } from '@/hooks/useChains'
import useSafeInfo from '@/hooks/useSafeInfo'
import { isMultisigExecutionDetails } from '@/utils/transaction-guards'
import { EMPTY_DATA } from '@gnosis.pm/safe-core-sdk/dist/src/utils/constants'
import { encodeMultiSendData } from '@gnosis.pm/safe-core-sdk/dist/src/utils/transactions/utils'
import { MetaTransactionData, OperationType } from '@gnosis.pm/safe-core-sdk-types/dist/src/types'
import { useWeb3 } from '@/hooks/wallets/web3'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  DialogContent,
  Skeleton,
  Typography,
} from '@mui/material'
import EthHashInfo from '@/components/common/EthHashInfo'
import { useEffect, useState } from 'react'
import { Multi_send_call_only } from '@/types/contracts/Multi_send_call_only'
import { createExistingTx } from '@/services/tx/txSender'
import { txDispatch, TxEvent } from '@/services/tx/txEvents'
import { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'
import { generateDataRowValue } from '@/components/transactions/TxDetails/Summary/TxDataRow'

export const getTxRecipient = (txInfo: TransactionInfo, safeAddress: string): string => {
  switch (txInfo.type) {
    case 'Transfer':
      if (txInfo.transferInfo.type === TransactionTokenType.NATIVE_COIN) {
        return txInfo.recipient.value
      } else {
        return (txInfo.transferInfo as Erc20Transfer | Erc721Transfer).tokenAddress
      }
    case 'Custom':
      return txInfo.to.value
    case 'Creation':
    case 'SettingsChange':
    default:
      return safeAddress
  }
}

export const getTxValue = (txInfo: TransactionInfo, txDetails: TransactionDetails): string => {
  switch (txInfo.type) {
    case 'Transfer':
      if (txInfo.transferInfo.type === TransactionTokenType.NATIVE_COIN) {
        return txInfo.transferInfo.value
      } else {
        return txDetails.txData?.value ?? '0'
      }
    case 'Custom':
      return txInfo.value
    case 'Creation':
    case 'SettingsChange':
    default:
      return '0'
  }
}

const getSignatures = (confirmations: MultisigConfirmation[]) => {
  return confirmations
    .filter((confirmation) => Boolean(confirmation.signature))
    .sort((a, b) => a.signer.value.toLowerCase().localeCompare(b.signer.value.toLocaleLowerCase()))
    .reduce((prev, current) => {
      return prev + current.signature?.slice(2)
    }, '0x')
}

const getMultiSendTxs = (
  txs: TransactionDetails[],
  chain: ChainInfo,
  safeAddress: string,
  safeVersion: string,
): MetaTransactionData[] => {
  const safeContractInstance = getGnosisSafeContractInstance(chain, safeVersion)

  return txs
    .map((tx) => {
      if (!isMultisigExecutionDetails(tx.detailedExecutionInfo)) return

      const args = {
        to: getTxRecipient(tx.txInfo, safeAddress),
        value: getTxValue(tx.txInfo, tx),
        data: tx.txData?.hexData || EMPTY_DATA,
        operation: tx.txData?.operation || Operation.CALL,
        safeTxGas: tx.detailedExecutionInfo.safeTxGas,
        baseGas: tx.detailedExecutionInfo.baseGas,
        gasPrice: tx.detailedExecutionInfo.gasPrice,
        gasToken: tx.detailedExecutionInfo.gasToken,
        refundReceiver: tx.detailedExecutionInfo.refundReceiver.value,
        signatures: getSignatures(tx.detailedExecutionInfo.confirmations),
      }
      const data = safeContractInstance.interface.encodeFunctionData('execTransaction', [
        args.to,
        args.value,
        args.data,
        args.operation,
        args.safeTxGas,
        args.baseGas,
        args.gasPrice,
        args.gasToken,
        args.refundReceiver,
        args.signatures,
      ])

      return {
        operation: OperationType.Call,
        to: safeAddress,
        value: '0',
        data,
      }
    })
    .filter(Boolean) as MetaTransactionData[]
}

const getTxsWithDetails = (txs: Transaction[], chainId: string) => {
  return Promise.all(
    txs.map(async (tx) => {
      return await getTransactionDetails(chainId, tx.transaction.id)
    }),
  )
}

const getTxs = (txs: Transaction[], chainId: string, safeAddress: string): Promise<SafeTransaction[]> => {
  return Promise.all(
    txs.map(async (tx) => {
      return await createExistingTx(chainId, safeAddress, tx.transaction)
    }),
  )
}

export const getParameterElement = ({ name, type, value }: DecodedDataBasicParameter) => {
  let valueElement

  if (!Array.isArray(value)) {
    switch (type) {
      case 'address':
        valueElement = <EthHashInfo address={value} showAvatar showCopyButton hasExplorer />
        break
      case 'bytes':
        valueElement = <Box margin={2}>{generateDataRowValue(value, 'rawData')}</Box>
        break
    }
  }

  if (!valueElement) {
    valueElement = <Typography>{JSON.stringify(value)}</Typography>
  }

  return (
    <Box>
      <Typography color="secondary.light">
        {name} ({type})
      </Typography>
      {valueElement}
    </Box>
  )
}

const DecodedTxInfo = ({ tx, chainId }: { tx: SafeTransaction; chainId: string }) => {
  const [decodedData, error] = useAsync<DecodedDataResponse | undefined>(async () => {
    if (isNaN(parseInt(tx.data.data, 16))) return

    return getDecodedData(chainId, tx.data.data)
  }, [tx.data.data])

  return (
    <Box mt={2}>
      <Accordion elevation={0}>
        <AccordionSummary>
          <CodeIcon color="border" />
          <Box ml="4px">{decodedData?.method ?? 'Contract Interaction'}</Box>
          <Box justifySelf="flex-end" marginLeft="auto">
            {generateDataRowValue(tx.data.data, 'rawData')}
          </Box>
        </AccordionSummary>

        <AccordionDetails>
          <Box display="flex" flexDirection="column" gap={2}>
            {decodedData && decodedData.parameters.length > 0 ? (
              decodedData.parameters.map((param) => getParameterElement(param))
            ) : (
              <Box>
                <Typography color="secondary.light">Interact with:</Typography>
                <EthHashInfo address={tx.data.to} showAvatar showCopyButton hasExplorer />
              </Box>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  )
}

const ReviewBatchExecute = ({ data, onSubmit }: { data: BatchExecuteData; onSubmit: (data: null) => void }) => {
  const [multiSendContract, setMultiSendContract] = useState<Multi_send_call_only>()
  const [multiSendTxData, setMultiSendTxData] = useState<string>()
  const chain = useCurrentChain()
  const { safe } = useSafeInfo()
  const provider = useWeb3()

  const [txsWithDetails, _, loading] = useAsync<TransactionDetails[] | undefined>(async () => {
    if (!chain?.chainId) return

    return getTxsWithDetails(data.txs, chain.chainId)
  }, [data.txs, chain?.chainId])

  const [safeTxs, safeTxsError, safeTxsLoading] = useAsync<SafeTransaction[] | undefined>(async () => {
    if (!chain?.chainId) return

    return getTxs(data.txs, chain.chainId, safe.address.value)
  }, [data.txs, chain?.chainId, safe.address.value])

  useEffect(() => {
    if (!chain) return

    setMultiSendContract(getMultiSendCallOnlyContractInstance(chain.chainId))
  }, [chain])

  useEffect(() => {
    if (!txsWithDetails || !chain) return

    const multiSendTxs = getMultiSendTxs(txsWithDetails, chain, safe.address.value, safe.version)
    const data = encodeMultiSendData(multiSendTxs)

    setMultiSendTxData(data)
  }, [chain, safe.address.value, safe.version, txsWithDetails])

  const sendTx = async () => {
    if (!provider || !multiSendTxData || !chain || !multiSendContract) return

    const multisendTransaction = await multiSendContract.connect(provider.getSigner()).multiSend(multiSendTxData)

    data.txs.forEach((tx) => {
      createExistingTx(chain.chainId, safe.address.value, tx.transaction).then((safeTx) =>
        txDispatch(TxEvent.MINING, { txId: tx.transaction.id, txHash: multisendTransaction.hash, tx: safeTx }),
      )
    })

    onSubmit(null)
  }

  return (
    <div>
      <DialogContent>
        <Typography variant="body2" mb={2}>
          This transaction batches a total of {data.txs.length} transactions from your queue into a single Ethereum
          transaction. Please check every included transaction carefully, especially if you have rejection transactions,
          and make sure you want to execute all of them. Included transactions are highlighted in green when you hover
          over the execute button.
        </Typography>
        <Typography>Interact with:</Typography>
        {multiSendContract && (
          <EthHashInfo address={multiSendContract.address} shortAddress={false} hasExplorer showCopyButton />
        )}
        {multiSendTxData && (
          <>
            <Typography mt={2}>Data (hex encoded)</Typography>
            {generateDataRowValue(multiSendTxData, 'rawData')}
          </>
        )}
        {safeTxs &&
          chain &&
          safeTxs.map((safeTx) => <DecodedTxInfo key={safeTx.data.nonce} tx={safeTx} chainId={chain.chainId} />)}
        {safeTxsLoading && (
          <Box display="flex" flexDirection="column" gap={2} mt={2}>
            {data.txs.map((tx) => (
              <Skeleton key={tx.transaction.id} variant="rectangular" height={52} sx={{ borderRadius: 2 }} />
            ))}
          </Box>
        )}
        <Typography variant="body2" mt={2} textAlign="center">
          Be aware that if any of the included transactions revert, none of them will be executed. This will result in
          the loss of the allocated transaction fees.
        </Typography>
        <Button
          onClick={sendTx}
          disabled={loading}
          variant="contained"
          sx={{ position: 'absolute', bottom: '24px', right: '24px', zIndex: 1 }}
        >
          Send
        </Button>
      </DialogContent>
    </div>
  )
}

export default ReviewBatchExecute
