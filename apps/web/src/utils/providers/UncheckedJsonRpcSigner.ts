import { JsonRpcSigner, type TransactionRequest, type TransactionResponse } from 'ethers'

/**
 * This class is basically a copy of the UncheckedJonRpcSigner from ethers.js v 5.7:
 * https://github.com/ethers-io/ethers.js/blob/v5.7/packages/providers/src.ts/json-rpc-provider.ts#L370
 *
 * Why do we need this?
 * If you have 2 Wallets - a Parent wallet and a Child Wallet. The parent is the owner of the child.
 * You connect the child to the Parent through Walletconnect and then use the parent to sign and execute tx.
 *
 * In such case if you use the normal JsonRpcSigner from ethers.js to sign a transaction off-chain the UI will be
 * stuck, because the signer will wait for the transaction receipt to come back from the RPC Server (which won't happen
 * because we are just signing and not executing the tx on chain). In such cases however we need to return immediately
 * with a hash. If we don't the UI in the child is stuck. Waiting for the promise to resolve.
 */
export class UncheckedJsonRpcSigner extends JsonRpcSigner {
  async sendTransaction(transaction: TransactionRequest): Promise<TransactionResponse> {
    return this.sendUncheckedTransaction(transaction).then((hash) => {
      return <TransactionResponse>(<unknown>{
        hash,
        nonce: null,
        gasLimit: null,
        gasPrice: null,
        data: null,
        value: null,
        chainId: null,
        confirmations: 0,
        from: null,
        wait: (confirmations?: number) => {
          return this.provider.waitForTransaction(hash, confirmations)
        },
      })
    })
  }
}
