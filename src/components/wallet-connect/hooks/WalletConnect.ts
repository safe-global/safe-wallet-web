import { IS_PRODUCTION, WC_PROJECT_ID } from '@/config/constants'
import { Core } from '@walletconnect/core'
import { Web3Wallet, type Web3WalletTypes } from '@walletconnect/web3wallet'
import { type JsonRpcResponse } from '@walletconnect/jsonrpc-utils'

import type Web3WalletType from '@walletconnect/web3wallet'
import { type SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { type SessionTypes } from 'walletconnect-v2-types'
import { EVMBasedNamespaces, SAFE_COMPATIBLE_METHODS, SAFE_WALLET_METADATA, WC_ERRORS } from './constants'

const logger = IS_PRODUCTION ? undefined : 'debug'

export class WalletConnect {
  private web3Wallet: Web3WalletType | undefined
  private safe: SafeInfo
  private currentSession: SessionTypes.Struct | undefined

  constructor(safe: SafeInfo) {
    this.safe = safe
    this.initializeWalletConnect()
  }

  private async initializeWalletConnect() {
    const core = new Core({
      projectId: WC_PROJECT_ID,
      logger,
    })

    const web3wallet = await Web3Wallet.init({
      core,
      metadata: SAFE_WALLET_METADATA,
    })

    this.web3Wallet = web3wallet
  }

  isConnected() {
    return !!this.currentSession
  }

  getMetadata() {
    return this.currentSession?.peer.metadata
  }

  getSessionTopic() {
    return this.currentSession?.topic
  }

  restoreExistingConnection() {
    console.log('WC trying to restore for safe', this.safe)

    if (!this.web3Wallet) {
      return
    }
    // we try to find a compatible active session
    const activeSessions = this.web3Wallet.getActiveSessions()
    console.log('Active Sessions', activeSessions)

    const compatibleSession = Object.keys(activeSessions)
      .map((topic) => activeSessions[topic])
      .find((session) =>
        session.namespaces[EVMBasedNamespaces].accounts[0].includes(
          `${EVMBasedNamespaces}:${this.safe.chainId}:${this.safe.address.value}`,
        ),
      )

    if (compatibleSession) {
      this.currentSession = compatibleSession
    }
  }

  async connect(uri: string) {
    const isValidWalletConnectUri = uri && uri.startsWith('wc')

    if (isValidWalletConnectUri && this.web3Wallet) {
      await this.web3Wallet.core.pairing.pair({ uri })
    }
  }

  async disconnect() {
    if (!this.web3Wallet || !this.currentSession) {
      throw Error('Cannot disconnect if no session is active')
    }

    await this.web3Wallet.disconnectSession({
      topic: this.currentSession.topic,
      reason: {
        code: WC_ERRORS.USER_DISCONNECTED_CODE,
        message: 'User disconnected. Safe Wallet Session ended by the user',
      },
    })

    this.currentSession = undefined
  }

  resetSession() {
    this.currentSession = undefined
  }

  onSessionProposal(handler: (proposal: Web3WalletTypes.SessionProposal) => void): () => void {
    // events
    this.web3Wallet?.on('session_proposal', handler)
    return () => this.web3Wallet?.off('session_proposal', handler)
  }

  onSessionDelete(handler: () => void): () => void {
    this.web3Wallet?.on('session_delete', handler)
    return () => this.web3Wallet?.off('session_delete', handler)
  }

  onSessionRequest(handler: (event: Web3WalletTypes.SessionRequest) => void): () => void {
    console.log('Registering session request handler')
    this.web3Wallet?.on('session_request', handler)
    return () => this.web3Wallet?.off('session_request', handler)
  }

  async approveSessionProposal(sessionProposal: Web3WalletTypes.SessionProposal, onMismatchingNamespaces: () => void) {
    if (!this.web3Wallet) {
      throw new Error('Web3Wallet needs to be initialized first')
    }

    const { id, params } = sessionProposal
    const { requiredNamespaces } = params
    const requiredNamespace = requiredNamespaces[EVMBasedNamespaces]

    const safeChain = `${EVMBasedNamespaces}:${this.safe.chainId}`
    const safeEvents = requiredNamespace?.events || [] // we accept all events like chainChanged & accountsChanged (even if they are not compatible with the Safe)

    const requiredChains = [...(requiredNamespace.chains ?? [])]
    // If the user accepts we always return all required namespaces and add the safe chain to it
    const safeAccount = `${EVMBasedNamespaces}:${this.safe.chainId}:${this.safe.address.value}`

    // We first pretend that our Safe is available on all required networks
    const safeOnRequiredChains = requiredChains.map(
      (requiredChain) => `${requiredChain ?? safeChain}:${this.safe.address.value}`,
    )

    let wcSession: SessionTypes.Struct
    try {
      wcSession = await this.web3Wallet.approveSession({
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
      wcSession = await this.web3Wallet.approveSession({
        id,
        namespaces: {
          eip155: {
            accounts: safeOnRequiredChains.includes(safeAccount)
              ? safeOnRequiredChains
              : [safeAccount, ...safeOnRequiredChains], // Add all required chains on top
            chains: requiredChains, // return the required Safes
            methods: SAFE_COMPATIBLE_METHODS, // only the Safe methods
            events: safeEvents,
          },
        },
      })
    }

    this.currentSession = wcSession

    // Then we update the session and reduce the Safe to the requested network only
    if (!safeOnRequiredChains.includes(safeAccount) || safeOnRequiredChains.length > 1) {
      if (!requiredChains.includes(safeChain)) {
        requiredChains.push(safeChain)
      }

      // Emit accountsChanged and chainChanged event
      try {
        await this.web3Wallet.updateSession({
          topic: wcSession.topic,
          namespaces: {
            eip155: {
              accounts: [safeAccount],
              chains: requiredChains,
              methods: SAFE_COMPATIBLE_METHODS,
              events: safeEvents,
            },
          },
        })
      } catch (error) {
        onMismatchingNamespaces()
      }
    }
  }

  async sendSessionResponse(params: { topic: string; response: JsonRpcResponse<any> }) {
    if (!this.web3Wallet) {
      throw new Error('Web3Wallet needs to be initialized first')
    }

    await this.web3Wallet.respondSessionRequest(params)
  }

  async updateSafeInfo(safe: SafeInfo) {
    this.safe = safe

    if (!this.currentSession || !this.web3Wallet) {
      return
    }

    //  We have to update the active session
    const safeAccount = `${EVMBasedNamespaces}:${safe.chainId}:${safe.address.value}`
    const safeChain = `${EVMBasedNamespaces}:${safe.chainId}`
    const currentNamespace = this.currentSession.namespaces[EVMBasedNamespaces]
    const chainIsSet = currentNamespace.chains?.includes(safeChain)

    await this.web3Wallet.updateSession({
      topic: this.currentSession.topic,
      namespaces: {
        eip155: {
          ...currentNamespace,
          accounts: [safeAccount],
          chains: chainIsSet ? currentNamespace.chains : [...(currentNamespace.chains ?? []), safeChain],
        },
      },
    })
  }
}
