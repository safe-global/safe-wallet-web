import { proposeTransaction, type Operation } from '@gnosis.pm/safe-react-gateway-sdk'
import type { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'
import { getSafeSDK } from '@/services/safe-core/useInitSafeCoreSDK'

const proposeTx = async (chainId: string, safeAddress: string, sender: string, tx: SafeTransaction) => {
  const safeSDK = getSafeSDK()

  if (!safeSDK) {
    throw new Error('Safe SDK not initialized')
  }

  const safeTxHash = await safeSDK.getTransactionHash(tx)

  return await proposeTransaction(chainId, safeAddress, {
    ...tx.data,
    safeTxHash,
    sender,
    value: parseInt(tx.data.value, 16).toString(),
    operation: tx.data.operation as unknown as Operation,
    nonce: tx.data.nonce.toString(),
    safeTxGas: tx.data.safeTxGas.toString(),
    baseGas: tx.data.baseGas.toString(),
    gasPrice: tx.data.gasPrice.toString(),
    signature: tx.signatures.size ? tx.encodedSignatures() : undefined,
    origin: null,
  })
}

export default proposeTx
