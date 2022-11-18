import AccessTimeIcon from '@mui/icons-material/AccessTime'
import useAsync from '@/hooks/useAsync'
import useSafeInfo from '@/hooks/useSafeInfo'
import { sameAddress } from '@/utils/addresses'
import { isMultiSendTxInfo } from '@/utils/transaction-guards'
import type { TransactionDetails, TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'
import { getTransactionDetails } from '@gnosis.pm/safe-react-gateway-sdk'
import { Box, Tooltip } from '@mui/material'
import { BigNumber, ethers } from 'ethers'
import { AbiCoder, Interface } from 'ethers/lib/utils'
import { isPast } from 'date-fns'
import chains from '@/config/chains'

const TxTimingDetails = ({ txId }: { txId: string }) => {
  const { safe, safeAddress } = useSafeInfo()

  const [txDetails] = useAsync<TransactionDetails>(
    () => {
      if (!txId || !safeAddress) return

      return getTransactionDetails(safe.chainId, txId).then((details) => {
        // If the transaction is not related to the current safe, throw an error
        if (!sameAddress(details.safeAddress, safeAddress)) {
          return Promise.reject(new Error('Transaction with this id was not found in this Safe'))
        }
        return details
      })
    },
    [txId, safe.chainId, safe.txQueuedTag, safe.txHistoryTag, safeAddress],
    false,
  )
  const timeLockAddress =
    safe.chainId === chains.eth
      ? '2d96225942ada8e7f928b172c75df7b1c3baf343'
      : '6e8c8403837e305a0312beba98b7001c117a69a7'
  const humanReadableAbi = ['function checkLock(uint) public view']
  const timeLockInterface = new Interface(humanReadableAbi)

  const multiSendData = txDetails?.txData?.hexData?.toLowerCase()
  if (multiSendData?.includes(timeLockAddress)) {
    // Timelocked tx, decode the timestamp, hacky for now
    const startOfData = multiSendData.indexOf(timeLockAddress)
    const txMetaData = ethers.utils.hexZeroPad(
      `0x${multiSendData.slice(startOfData + 40, startOfData + 40 + 64 + 64)}`,
      32 * 2,
    )

    const abiCoder = new AbiCoder()
    const [_, txDataByteLength] = abiCoder.decode(['uint256', 'uint256'], txMetaData)

    const dataLength = (txDataByteLength as BigNumber).toNumber() * 2
    let txData = `0x${multiSendData.slice(startOfData + 168, startOfData + 168 + dataLength)}`

    const decodedTxData = timeLockInterface.decodeFunctionData('checkLock', txData)

    const timestamp = BigNumber.from(decodedTxData[0]).toNumber()
    const date = new Date(timestamp * 1000)
    const canBeExecuted = isPast(date)
    if (canBeExecuted) {
      return null
    }
    return (
      <Tooltip
        arrow
        placement="top"
        title={`This transaction is not executable before ${date.toLocaleDateString()} - ${date.toLocaleTimeString()}`}
      >
        <Box alignItems="center" display="flex">
          <AccessTimeIcon color="warning" fontSize="small" />
        </Box>
      </Tooltip>
    )
  }

  return null
}

const TxTimingInfo = ({ transaction }: { transaction: TransactionSummary }) => {
  const { safe } = useSafeInfo()

  if ((safe.chainId === chains.eth || safe.chainId === chains.gor) && isMultiSendTxInfo(transaction.txInfo)) {
    return <TxTimingDetails txId={transaction.id} />
  }
  return null
}

export default TxTimingInfo
