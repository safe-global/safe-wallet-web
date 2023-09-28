type SafeInfo = {
  safeAddress: string
  chainId: number
}

export type AppInfo = {
  name: string
  description: string
  url: string
  iconUrl: string
}

export type WalletSDK = {
  signMessage: (message: string, appInfo: AppInfo) => Promise<{ signature?: string }>
  signTypedMessage: (typedData: unknown, appInfo: AppInfo) => Promise<{ signature?: string }>
  send: (params: { txs: unknown[]; params: { safeTxGas: number } }, appInfo: AppInfo) => Promise<{ safeTxHash: string }>
  getBySafeTxHash: (safeTxHash: string) => Promise<{ txHash?: string }>
  switchChain: (chainId: string, appInfo: AppInfo) => Promise<null>
  proxy: (method: string, params: unknown[]) => Promise<unknown>
}

interface RpcRequest {
  method: string
  params?: unknown[]
}

enum RpcErrorCode {
  INVALID_PARAMS = -32602,
  USER_REJECTED = 4001,
  UNSUPPORTED_METHOD = 4200,
  UNSUPPORTED_CHAIN = 4901,
}

class RpcError extends Error {
  code: RpcErrorCode

  constructor(code: RpcErrorCode, message: string) {
    super(message)
    this.code = code
  }
}

export class SafeWalletProvider {
  private readonly safe: SafeInfo
  private readonly sdk: WalletSDK
  private submittedTxs = new Map<string, unknown>()

  constructor(safe: SafeInfo, sdk: WalletSDK) {
    this.safe = safe
    this.sdk = sdk
  }

  private async makeRequest(id: number, request: RpcRequest, appInfo: AppInfo): Promise<unknown> {
    const { method, params = [] } = request

    switch (method) {
      case 'wallet_switchEthereumChain':
        const [{ chainId }] = params as [{ chainId: string }]
        try {
          await this.sdk.switchChain(chainId, appInfo)
        } catch (e) {
          throw new RpcError(RpcErrorCode.UNSUPPORTED_CHAIN, 'Unsupported chain')
        }
        return null

      case 'eth_accounts':
        return [this.safe.safeAddress]

      case 'net_version':
      case 'eth_chainId':
        return `0x${this.safe.chainId.toString(16)}`

      case 'personal_sign': {
        const [message, address] = params as [string, string]

        if (this.safe.safeAddress.toLowerCase() !== address.toLowerCase()) {
          throw new RpcError(RpcErrorCode.INVALID_PARAMS, 'The address or message hash is invalid')
        }

        const response = await this.sdk.signMessage(message, appInfo)
        const signature = 'signature' in response ? response.signature : undefined

        return signature || '0x'
      }

      case 'eth_sign': {
        const [address, messageHash] = params as [string, string]

        if (this.safe.safeAddress.toLowerCase() !== address.toLowerCase() || !messageHash.startsWith('0x')) {
          throw new RpcError(RpcErrorCode.INVALID_PARAMS, 'The address or message hash is invalid')
        }

        const response = await this.sdk.signMessage(messageHash, appInfo)
        const signature = 'signature' in response ? response.signature : undefined

        return signature || '0x'
      }

      case 'eth_signTypedData':
      case 'eth_signTypedData_v4': {
        const [address, typedData] = params as [string, unknown]
        const parsedTypedData = typeof typedData === 'string' ? JSON.parse(typedData) : typedData

        if (this.safe.safeAddress.toLowerCase() !== address.toLowerCase()) {
          throw new RpcError(RpcErrorCode.INVALID_PARAMS, 'The address is invalid')
        }

        const response = await this.sdk.signTypedMessage(parsedTypedData, appInfo)
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

        const { safeTxHash } = await this.sdk.send(
          {
            txs: [tx],
            params: { safeTxGas: Number(tx.gas) },
          },
          appInfo,
        )

        // Store fake transaction
        this.submittedTxs.set(safeTxHash, {
          from: this.safe.safeAddress,
          hash: safeTxHash,
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

        return safeTxHash

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

  async request(
    id: number,
    request: RpcRequest,
    appInfo: AppInfo,
  ): Promise<
    | {
        jsonrpc: string
        id: number
        result: unknown
      }
    | {
        jsonrpc: string
        id: number
        error: {
          code: number
          message: string
        }
      }
  > {
    try {
      return {
        jsonrpc: '2.0',
        id,
        result: await this.makeRequest(id, request, appInfo),
      }
    } catch (e) {
      return {
        jsonrpc: '2.0',
        id,
        error: {
          code: -32000,
          message: (e as Error).message,
        },
      }
    }
  }
}
