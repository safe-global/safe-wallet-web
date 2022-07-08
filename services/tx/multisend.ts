import { MetaTransactionData } from '@gnosis.pm/safe-core-sdk-types'
import { BigNumber, ethers } from 'ethers'

const MULTISEND_ABI = 'function multiSend(bytes memory transactions)'

export interface MultiSendTx {
  to: string
  value: string
  data: string
}

export const encodeMultiSendCall = (txs: MetaTransactionData[]): string => {
  const joinedTxs = getMultiSendJoinedTxs(txs)
  const multiSendInterface = new ethers.utils.Interface([MULTISEND_ABI])
  console.log(multiSendInterface.encodeFunctionData('multiSend', [joinedTxs]))
  return multiSendInterface.encodeFunctionData('multiSend', [joinedTxs])
}

export const getMultiSendJoinedTxs = (txs: MetaTransactionData[]): string => {
  const abiCoder = new ethers.utils.AbiCoder()
  const joinedTxs = txs
    .map((tx) =>
      [
        abiCoder.encode(['uint8'], [0]).slice(-2),
        abiCoder.encode(['address'], [tx.to]).slice(-40),
        // if you pass wei as number, it will overflow
        abiCoder.encode(['uint256'], [tx.value]).slice(-64),
        abiCoder.encode(['uint256'], [ethers.utils.hexDataLength(tx.data)]).slice(-64),
        tx.data.replace(/^0x/, ''),
      ].join(''),
    )
    .join('')
  return `0x${joinedTxs}`
}

/**
 * Decodes the data of a multiSend tx into its separate txs
 *
 * @param data tx.data
 * @returns Array of multiSend MetaTransactionData
 */
export const decodeMultiSendTxs = (data: string): MetaTransactionData[] => {
  const multiSendInterface = new ethers.utils.Interface([MULTISEND_ABI])
  const abiCoder = new ethers.utils.AbiCoder()
  // decode multiSend and remove '0x'
  let remainingData = multiSendInterface.decodeFunctionData('multiSend', data)[0].slice(2)

  const txs: MetaTransactionData[] = []
  while (remainingData.length > 0) {
    const txDataEncoded = ethers.utils.hexZeroPad(`0x${remainingData.slice(2, 170)}`, 32 * 3)
    const [txTo, txValue, txDataByteLength] = abiCoder.decode(['address', 'uint256', 'uint256'], txDataEncoded)
    remainingData = remainingData.slice(170)

    const dataLength = (txDataByteLength as BigNumber).toNumber() * 2
    let txData = `0x${remainingData.slice(0, dataLength)}`
    remainingData = remainingData.slice(dataLength)
    txs.push({
      to: txTo.toString(),
      value: txValue.toString(),
      data: txData,
    })
  }

  return txs
}
