type SafeInfo = {
  safeAddress: string
  chainId: number
}

type WalletSDK = {
  signMessage: (message: string) => Promise<{ signature?: string }>
  signTypedMessage: (typedData: unknown) => Promise<{ signature?: string }>
  send: (params: { txs: unknown[]; params: { safeTxGas: number } }) => Promise<{ safeTxHash: string }>
  getBySafeTxHash: (safeTxHash: string) => Promise<{ txHash?: string }>
  proxy: (method: string, params: unknown[]) => Promise<unknown>
}

interface RpcRequest {
  method: string
  params?: unknown[]
}

export class SafeWalletProvider {
  private readonly safe: SafeInfo
  private readonly sdk: WalletSDK
  private submittedTxs = new Map<string, unknown>()

  constructor(safe: SafeInfo, sdk: WalletSDK) {
    this.safe = safe
    this.sdk = sdk
  }

  async request(request: RpcRequest): Promise<unknown> {
    const { method, params = [] } = request

    switch (method) {
      case 'eth_accounts':
        return [this.safe.safeAddress]

      case 'net_version':
      case 'eth_chainId':
        return `0x${this.safe.chainId.toString(16)}`

      case 'personal_sign': {
        const [message, address] = params as [string, string]

        if (this.safe.safeAddress.toLowerCase() !== address.toLowerCase()) {
          throw new Error('The address or message hash is invalid')
        }

        const response = await this.sdk.signMessage(message)
        const signature = 'signature' in response ? response.signature : undefined

        return signature || '0x'
      }

      case 'eth_sign': {
        const [address, messageHash] = params as [string, string]

        if (this.safe.safeAddress.toLowerCase() !== address.toLowerCase() || !messageHash.startsWith('0x')) {
          throw new Error('The address or message hash is invalid')
        }

        const response = await this.sdk.signMessage(messageHash)
        const signature = 'signature' in response ? response.signature : undefined

        return signature || '0x'
      }

      case 'eth_signTypedData':
      case 'eth_signTypedData_v4': {
        const [address, typedData] = params as [string, unknown]
        const parsedTypedData = typeof typedData === 'string' ? JSON.parse(typedData) : typedData

        if (this.safe.safeAddress.toLowerCase() !== address.toLowerCase()) {
          throw new Error('The address is invalid')
        }

        const response = await this.sdk.signTypedMessage(parsedTypedData)
        const signature = 'signature' in response ? response.signature : undefined
        return signature || '0x'
      }

      case 'eth_sendTransaction':
        const tx = {
          value: '0',
          data: '0x',
          ...(params[0] as { gas: string | number; to: string }),
        }

        // Some ethereum libraries might pass the gas as a hex-encoded string
        // We need to convert it to a number because the SDK expects a number and our backend only supports
        // Decimal numbers
        if (typeof tx.gas === 'string' && tx.gas.startsWith('0x')) {
          tx.gas = parseInt(tx.gas, 16)
        }

        const resp = await this.sdk.send({
          txs: [tx],
          params: { safeTxGas: Number(tx.gas) },
        })

        // Store fake transaction
        this.submittedTxs.set(resp.safeTxHash, {
          from: this.safe.safeAddress,
          hash: resp.safeTxHash,
          gas: 0,
          gasPrice: '0x00',
          nonce: 0,
          input: tx.data,
          value: tx.value,
          to: tx.to,
          blockHash: null,
          blockNumber: null,
          transactionIndex: null,
        })
        return resp.safeTxHash

      case 'eth_getTransactionByHash':
        let txHash = params[0] as string
        try {
          const resp = await this.sdk.getBySafeTxHash(txHash)
          txHash = resp.txHash || txHash
        } catch (e) {}
        // Use fake transaction if we don't have a real tx hash
        if (this.submittedTxs.has(txHash)) {
          return this.submittedTxs.get(txHash)
        }
        return await this.sdk.proxy(method, [txHash])

      case 'eth_getTransactionReceipt': {
        let txHash = params[0] as string
        try {
          const resp = await this.sdk.getBySafeTxHash(txHash)
          txHash = resp.txHash || txHash
        } catch (e) {}
        return this.sdk.proxy(method, params)
      }

      default:
        return await this.sdk.proxy(method, params)
    }
  }
}
