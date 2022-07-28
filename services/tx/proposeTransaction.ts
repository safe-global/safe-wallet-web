import { proposeTransaction, Operation, TransactionDetails } from '@gnosis.pm/safe-react-gateway-sdk'
import type { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'

// It's important to cache proposals to avoid re-proposing the same transaction
// Backend returns an error if you try to propose the same transaction twice
const cache: Record<string, TransactionDetails> = {}

const proposeTx = async (
  chainId: string,
  safeAddress: string,
  sender: string,
  safeTxHash: string,
  tx: SafeTransaction,
): Promise<TransactionDetails> => {
  const signatures = tx.signatures.size ? tx.encodedSignatures() : undefined
  const cacheKey = `${safeTxHash}_${signatures || ''}`

  if (cache[cacheKey]) {
    return cache[cacheKey]
  }

  const proposedTx = await proposeTransaction(chainId, safeAddress, {
    ...tx.data,
    safeTxHash,
    sender,
    value: tx.data.value.toString(),
    operation: tx.data.operation as unknown as Operation,
    nonce: tx.data.nonce.toString(),
    safeTxGas: tx.data.safeTxGas.toString(),
    baseGas: tx.data.baseGas.toString(),
    gasPrice: tx.data.gasPrice.toString(),
    signature: signatures,
  })

  cache[cacheKey] = proposedTx

  return proposedTx
}

export default proposeTx
