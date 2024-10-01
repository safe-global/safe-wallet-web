import DecodedTx from '@/components/tx/DecodedTx'
import useAsync from '@/hooks/useAsync'
import { useCurrentChain } from '@/hooks/useChains'
import useDecodeTx from '@/hooks/useDecodeTx'
import useSafeInfo from '@/hooks/useSafeInfo'
import { useWeb3ReadOnly } from '@/hooks/wallets/web3'
import { getMultiSendContractDeployment } from '@/services/contracts/deployments'
import { createTx } from '@/services/tx/tx-sender/create'
import { Safe__factory } from '@/types/contracts'
import { type TransactionDetails } from '@safe-global/safe-gateway-typescript-sdk'
import { zeroPadValue } from 'ethers'
import DecodedData from '../DecodedData'
import ErrorMessage from '@/components/tx/ErrorMessage'
import { useSafeSDK } from '@/hooks/coreSDK/safeCoreSDK'
import { MigrateToL2Information } from '@/components/tx/SignOrExecuteForm/MigrateToL2Information'
import { Box } from '@mui/material'

export const MigrationToL2TxData = ({ txDetails }: { txDetails: TransactionDetails }) => {
  const readOnlyProvider = useWeb3ReadOnly()
  const chain = useCurrentChain()
  const { safe } = useSafeInfo()
  const sdk = useSafeSDK()
  // Reconstruct real tx
  const [realSafeTx, realSafeTxError, realSafeTxLoading] = useAsync(async () => {
    // Fetch tx receipt from backend
    if (!txDetails.txHash || !chain || !sdk) {
      return undefined
    }
    const txResult = await readOnlyProvider?.getTransaction(txDetails.txHash)
    const txData = txResult?.data

    // Search for a Safe Tx to MultiSend contract
    const safeInterface = Safe__factory.createInterface()
    const execTransactionSelector = safeInterface.getFunction('execTransaction').selector.slice(2, 10)
    const multiSendDeployment = getMultiSendContractDeployment(chain, safe.version)
    const multiSendAddress = multiSendDeployment?.networkAddresses[chain.chainId]
    if (!multiSendAddress) {
      return undefined
    }
    const searchString = `${execTransactionSelector}${zeroPadValue(multiSendAddress, 32).slice(2)}`
    const indexOfTx = txData?.indexOf(searchString)
    if (indexOfTx && txData) {
      // Now we need to find the tx Data
      const parsedTx = safeInterface.parseTransaction({ data: `0x${txData.slice(indexOfTx)}` })

      const execTxArgs = parsedTx?.args
      if (!execTxArgs || execTxArgs.length < 10) {
        return undefined
      }
      return createTx({
        to: execTxArgs[0],
        value: execTxArgs[1].toString(),
        data: execTxArgs[2],
        operation: Number(execTxArgs[3]),
        safeTxGas: execTxArgs[4].toString(),
        baseGas: execTxArgs[5].toString(),
        gasPrice: execTxArgs[6].toString(),
        gasToken: execTxArgs[7].toString(),
        refundReceiver: execTxArgs[8],
      })
    }
  }, [readOnlyProvider, txDetails.txHash, chain, safe.version, sdk])

  const [decodedRealTx, decodedRealTxError] = useDecodeTx(realSafeTx)

  const decodedDataUnavailable = !realSafeTx && !realSafeTxLoading

  return (
    <Box>
      <MigrateToL2Information variant="history" />
      {realSafeTxError ? (
        <ErrorMessage>{realSafeTxError.message}</ErrorMessage>
      ) : decodedRealTxError ? (
        <ErrorMessage>{decodedRealTxError.message}</ErrorMessage>
      ) : decodedDataUnavailable ? (
        <DecodedData txData={txDetails.txData} />
      ) : (
        <DecodedTx decodedData={decodedRealTx} tx={realSafeTx} />
      )}
    </Box>
  )
}
