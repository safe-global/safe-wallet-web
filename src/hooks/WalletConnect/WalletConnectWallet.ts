import { Core } from '@walletconnect/core'
import type Web3WalletType from '@walletconnect/web3wallet'
import { Web3Wallet } from '@walletconnect/web3wallet'

import { IS_PRODUCTION, WC_PROJECT_ID } from '@/config/constants'
import { SAFE_WALLET_METADATA, EVMBasedNamespaces, WCErrorCodes, SAFE_COMPATIBLE_METHODS } from './constants'

class WalletConnectWallet {
  private web3Wallet: Web3WalletType | null = null
  private chainId: string
  private safeAddress: string

  constructor(chainId: string, safeAddress: string) {
    this.chainId = chainId
    this.safeAddress = safeAddress

    this.init().then((web3Wallet) => (this.web3Wallet = web3Wallet))
  }

  private async init(): Promise<Web3WalletType> {
    const core = new Core({
      projectId: WC_PROJECT_ID,
      logger: IS_PRODUCTION ? undefined : 'debug',
    })

    const web3wallet = await Web3Wallet.init({
      core,
      metadata: SAFE_WALLET_METADATA,
    })

    this.addOnSessionPropose()

    return web3wallet
  }

  private rejectResponse(id: number, code: number, message: string) {
    return {
      id,
      jsonrpc: '2.0',
      error: {
        code,
        message,
      },
    }
  }

  addOnRequest(callback: (method: string, params: unknown[]) => Promise<unknown>) {
    this.web3Wallet?.on('session_request', async (event) => {
      const { topic, id } = event
      const { request, chainId: transactionChainId } = event.params
      const { method, params } = request

      const isSafeChainId = transactionChainId === `${EVMBasedNamespaces}:${this.chainId}`

      // we only accept transactions from the Safe chain
      if (!isSafeChainId) {
        const errorMessage = 'Wrong chain. Please connect to a Safe Account on the right chain.'

        await this.web3Wallet?.respondSessionRequest({
          topic,
          response: this.rejectResponse(id, WCErrorCodes.UNSUPPORTED_CHAIN_ERROR_CODE, errorMessage),
        })
        return
      }

      let result
      if (method === 'eth_accounts') {
        result = [this.safeAddress]
      } else {
        result = await callback(method, params)
      }

      await this.web3Wallet?.respondSessionRequest({
        topic,
        response: {
          id,
          jsonrpc: '2.0',
          result,
        },
      })
    })
  }

  private addOnSessionPropose() {
    this.web3Wallet?.on('session_proposal', async (event) => {
      const { id, params } = event
      const { requiredNamespaces } = params

      const safeAccount = `${EVMBasedNamespaces}:${this.chainId}:${this.safeAddress}`
      const safeChain = `${EVMBasedNamespaces}:${this.chainId}`
      // we accept all events like chainChanged & accountsChanged (even if they are not compatible with the Safe)
      const safeEvents = requiredNamespaces[EVMBasedNamespaces]?.events || []

      try {
        await this.web3Wallet?.approveSession({
          id,
          namespaces: {
            eip155: {
              accounts: [safeAccount], // only the Safe account
              chains: [safeChain], // only the Safe chain
              methods: SAFE_COMPATIBLE_METHODS, // only the Safe methods
              events: safeEvents,
            },
          },
        })
      } catch (error) {
        await this.web3Wallet?.rejectSession({
          id: event.id,
          reason: {
            code: WCErrorCodes.UNSUPPORTED_CHAIN_ERROR_CODE,
            message: (error as Error).message,
          },
        })
      }
    })
  }

  async connect(uri: string) {
    if (uri.startsWith('wc')) {
      await this.web3Wallet?.core.pairing.pair({ uri })
    }
  }

  async disconnect() {
    const activeSessions = this.web3Wallet?.getActiveSessions() || []

    if (!activeSessions.length) return

    await Promise.all(
      Object.keys(activeSessions).map((topic) => {
        this.web3Wallet?.disconnectSession({
          topic,
          reason: {
            code: WCErrorCodes.USER_DISCONNECTED_CODE,
            message: 'Safe Wallet session ended by the user',
          },
        })
      }),
    )
  }
}

export default WalletConnectWallet
