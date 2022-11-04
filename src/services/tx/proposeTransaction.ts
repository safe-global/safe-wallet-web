import type { Operation, TransactionDetails } from '@gnosis.pm/safe-react-gateway-sdk'
import { proposeTransaction } from '@gnosis.pm/safe-react-gateway-sdk'
import type { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'

const proposeTx = async (
  chainId: string,
  safeAddress: string,
  sender: string,
  tx: SafeTransaction,
  safeTxHash: string,
  origin?: string,
): Promise<TransactionDetails> => {
  const signatures = tx.signatures.size ? tx.encodedSignatures() : undefined

  return proposeTransaction(chainId, safeAddress, {
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
    origin,
  })
}

export default proposeTx
