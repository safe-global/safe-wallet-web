import { proposeTransaction, type Operation } from '@gnosis.pm/safe-react-gateway-sdk'
import type { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'

import { getSafeSDK } from '@/services/web3'
import { getPrimaryAccount, _getOnboardState } from '@/services/onboard'

const proposeTx = async (chainId: string, safeAddress: string, tx: SafeTransaction) => {
  const safeTxHash = await getSafeSDK().getTransactionHash(tx)

  const state = _getOnboardState()
  const { address } = getPrimaryAccount(state.wallets)

  return await proposeTransaction(chainId, safeAddress, {
    ...tx.data,
    safeTxHash,
    sender: address,
    value: parseInt(tx.data.value, 16).toString(),
    operation: tx.data.operation as unknown as Operation,
    nonce: tx.data.nonce.toString(),
    safeTxGas: tx.data.safeTxGas.toString(),
    baseGas: tx.data.baseGas.toString(),
    gasPrice: tx.data.gasPrice.toString(),
    signature: tx.encodedSignatures(),
    origin: null,
  })
}

export default proposeTx
