import { didRevert } from '@/services/tx/utils'
import { txDispatch, TxEvent } from '@/services/tx/txEvents'

import type { JsonRpcProvider } from '@ethersproject/providers'

// Provider must be passed as an argument as it is undefined until initialised by `useInitWeb3`
export const waitForTx = async (provider: JsonRpcProvider, txId: string, txHash: string) => {
  const TIMEOUT_MINUTES = 6.5

  try {
    // If confirmations undefined (falling back to 1), this is blocking
    // https://docs.ethers.io/v5/single-page/#/v5/api/providers/provider/-%23-Provider-waitForTransaction
    const receipt = await provider.waitForTransaction(txHash, undefined, TIMEOUT_MINUTES * 60_000)

    if (!receipt) {
      throw new Error(`Transaction not mined in ${TIMEOUT_MINUTES} minutes. Be aware that it might still be mined.`)
    }

    if (didRevert(receipt)) {
      txDispatch(TxEvent.REVERTED, {
        txId,
        error: new Error(`Transaction reverted by EVM.`),
        receipt,
      })
    }

    // Tx successfully mined but we don't dispatch SUCCESS this as may be faster than our indexer
  } catch (error) {
    txDispatch(TxEvent.FAILED, {
      txId,
      error: error as Error,
    })
  }
}
