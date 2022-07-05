import { MetaTransactionData } from '@gnosis.pm/safe-core-sdk-types'
import { ethers } from 'ethers'

const MULTISEND_ABI = 'function multiSend(bytes memory transactions)'

export interface MultiSendTx {
  to: string
  value: string
  data: string
}

export const encodeMultiSendCall = (txs: MetaTransactionData[]): string => {
  const joinedTxs = getMultiSendJoinedTxs(txs)
  const multiSendInterface = new ethers.utils.Interface([MULTISEND_ABI])
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
        abiCoder.encode(['uint256'], [tx.value.toString()]).slice(-64),
        abiCoder.encode(['uint256'], [ethers.utils.hexDataLength(tx.data)]).slice(-64),
        tx.data.replace(/^0x/, ''),
      ].join(''),
    )
    .join('')

  return `0x${joinedTxs}`
}
