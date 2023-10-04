import { Core } from '@walletconnect/core'
import { Web3Wallet } from '@walletconnect/web3wallet'
import { buildApprovedNamespaces, getSdkError } from '@walletconnect/utils'
import type Web3WalletType from '@walletconnect/web3wallet'
import type { Web3WalletTypes } from '@walletconnect/web3wallet'
import type { SessionTypes } from '@walletconnect/types'
import { type JsonRpcResponse } from '@walletconnect/jsonrpc-utils'

import { IS_PRODUCTION, WC_PROJECT_ID } from '@/config/constants'
import { EIP155, SAFE_COMPATIBLE_METHODS, SAFE_WALLET_METADATA } from './constants'
import { invariant } from '@/utils/helpers'
import { getEip155ChainId, stripEip155Prefix } from './utils'

const SESSION_ADD_EVENT = 'session_add' as Web3WalletTypes.Event // Workaround: WalletConnect doesn't emit session_add event

function assertWeb3Wallet<T extends Web3WalletType | null>(web3Wallet: T): asserts web3Wallet {
  return invariant(web3Wallet, 'WalletConnect not initialized')
}

/**
 * An abstraction over the WalletConnect SDK to simplify event subscriptions
 * and add workarounds for dapps requesting wrong required chains.
 * Should be kept stateless exept for the web3Wallet instance.
 */
class WalletConnectWallet {
  private web3Wallet: Web3WalletType | null = null

  /**
   * Initialize WalletConnect wallet SDK
   */
  public async init() {
    if (this.web3Wallet) return

    const core = new Core({
      projectId: WC_PROJECT_ID,
      logger: IS_PRODUCTION ? undefined : 'debug',
    })

    const web3wallet = await Web3Wallet.init({
      core,
      metadata: SAFE_WALLET_METADATA,
    })

    this.web3Wallet = web3wallet
  }

  /**
   * Connect using a wc-URI
   */
  public async connect(uri: string) {
    assertWeb3Wallet(this.web3Wallet)

    await this.web3Wallet.core.pairing.pair({ uri })
  }

  public async chainChanged(topic: string, chainId: string) {
    const eipChainId = getEip155ChainId(chainId)

    return this.web3Wallet?.emitSessionEvent({
      topic,
      event: {
        name: 'chainChanged',
        data: Number(chainId),
      },
      chainId: eipChainId,
    })
  }

  public async accountsChanged(topic: string, chainId: string, address: string) {
    const eipChainId = getEip155ChainId(chainId)

    return this.web3Wallet?.emitSessionEvent({
      topic,
      event: {
        name: 'accountsChanged',
        data: [address],
      },
      chainId: eipChainId,
    })
  }

  public async approveSession(proposal: Web3WalletTypes.SessionProposal, currentChainId: string, safeAddress: string) {
    assertWeb3Wallet(this.web3Wallet)

    // Actual safe chainId
    const safeChains = [currentChainId]

    const getNamespaces = (chainIds: string[], methods: string[]) => {
      const eip155ChainIds = chainIds.map(getEip155ChainId)

      // Create a list of addresses for each chainId
      const eip155Accounts = eip155ChainIds.map((eip155ChainId) => `${eip155ChainId}:${safeAddress}`)

      return buildApprovedNamespaces({
        proposal: proposal.params,
        supportedNamespaces: {
          [EIP155]: {
            chains: eip155ChainIds,
            methods,
            accounts: eip155Accounts,
            // Don't include optionalNamespaces events
            events: proposal.params.requiredNamespaces[EIP155]?.events || [],
          },
        },
      })
    }

    // Approve the session proposal
    // Most dapps require mainnet, but we aren't always on mainnet
    // A workaround, pretend to support all required chains
    const requiredChains = proposal.params.requiredNamespaces[EIP155]?.chains || []
    // TODO: Filter against those which we support
    const optionalChains = proposal.params.optionalNamespaces[EIP155]?.chains || []
    const chains = safeChains.concat(requiredChains.map(stripEip155Prefix), optionalChains.map(stripEip155Prefix))

    const session = await this.web3Wallet.approveSession({
      id: proposal.id,
      namespaces: getNamespaces(chains, proposal.params.requiredNamespaces[EIP155]?.methods ?? SAFE_COMPATIBLE_METHODS),
    })

    // Workaround: WalletConnect doesn't have a session_add event
    this.web3Wallet?.events.emit(SESSION_ADD_EVENT)

    return session
  }

  private async updateSession(session: SessionTypes.Struct, chainId: string, safeAddress: string) {
    assertWeb3Wallet(this.web3Wallet)

    const currentEip155ChainIds = session.namespaces[EIP155]?.chains || []
    const currentEip155Accounts = session.namespaces[EIP155]?.accounts || []

    const newEip155ChainId = getEip155ChainId(chainId)
    const newEip155Account = `${newEip155ChainId}:${safeAddress}`

    const hasNewChainId = !currentEip155ChainIds.includes(newEip155ChainId)
    const hasNewAccount = !currentEip155Accounts.includes(newEip155Account)

    // Add new chainId and/or account to the session namespace
    if (hasNewChainId || hasNewAccount) {
      const namespaces: SessionTypes.Namespaces = {
        [EIP155]: {
          ...session.namespaces[EIP155],
          chains: [newEip155ChainId, ...currentEip155ChainIds],
          accounts: [newEip155Account, ...currentEip155Accounts],
        },
      }

      await this.web3Wallet.updateSession({
        topic: session.topic,
        namespaces,
      })
    }

    // Switch to the new account
    await this.accountsChanged(session.topic, chainId, safeAddress)

    // Switch to the new chain
    await this.chainChanged(session.topic, chainId)
  }

  public async updateSessions(chainId: string, safeAddress: string) {
    await Promise.all(this.getActiveSessions().map((session) => this.updateSession(session, chainId, safeAddress)))
  }

  public async rejectSession(proposal: Web3WalletTypes.SessionProposal) {
    assertWeb3Wallet(this.web3Wallet)

    await this.web3Wallet.rejectSession({
      id: proposal.id,
      reason: getSdkError('UNSUPPORTED_CHAINS'),
    })
  }

  /**
   * Subscribe to session proposals
   */
  public onSessionPropose(handler: (e: Web3WalletTypes.SessionProposal) => void) {
    // Subscribe to the session proposal event
    this.web3Wallet?.on('session_proposal', handler)

    // Return the unsubscribe function
    return () => {
      this.web3Wallet?.off('session_proposal', handler)
    }
  }

  /**
   * Subscribe to session add
   */
  public onSessionAdd(handler: () => void) {
    this.web3Wallet?.on(SESSION_ADD_EVENT, handler)

    return () => {
      this.web3Wallet?.off(SESSION_ADD_EVENT, handler)
    }
  }

  /**
   * Subscribe to session delete
   */
  public onSessionDelete(handler: () => void) {
    this.web3Wallet?.on('session_delete', handler)

    return () => {
      this.web3Wallet?.off('session_delete', handler)
    }
  }

  /**
   * Disconnect a session
   */
  public async disconnectSession(session: SessionTypes.Struct) {
    assertWeb3Wallet(this.web3Wallet)

    await this.web3Wallet.disconnectSession({
      topic: session.topic,
      reason: getSdkError('USER_DISCONNECTED'),
    })

    // Workaround: WalletConnect doesn't emit session_delete event when disconnecting from the wallet side
    this.web3Wallet?.events.emit('session_delete', session)
  }

  /**
   * Get active sessions
   */
  public getActiveSessions(): SessionTypes.Struct[] {
    const sessionsMap = this.web3Wallet?.getActiveSessions() || {}
    return Object.values(sessionsMap)
  }

  /**
   * Subscribe to requests
   */
  public onRequest(handler: (event: Web3WalletTypes.SessionRequest) => void) {
    this.web3Wallet?.on('session_request', handler)

    return () => {
      this.web3Wallet?.off('session_request', handler)
    }
  }

  /**
   * Send a response to a request
   */
  public async sendSessionResponse(topic: string, response: JsonRpcResponse<unknown>) {
    assertWeb3Wallet(this.web3Wallet)

    return await this.web3Wallet.respondSessionRequest({ topic, response })
  }
}

export default WalletConnectWallet
