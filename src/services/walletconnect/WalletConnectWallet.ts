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
import { getEip155ChainId } from './utils'
import type { Eip155ChainId } from './utils'

function assertWeb3Wallet<T extends Web3WalletType | null>(web3Wallet: T): asserts web3Wallet {
  return invariant(web3Wallet, 'WalletConnect not initialized')
}

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

  public async chainChanged(chainId: string) {
    const sessions = this.getActiveSessions()
    const eipChainId = getEip155ChainId(chainId)

    await Promise.all(
      Object.keys(sessions).map((topic) => {
        return this.web3Wallet?.emitSessionEvent({
          topic,
          event: {
            name: 'chainChanged',
            data: Number(chainId),
          },
          chainId: eipChainId,
        })
      }),
    )
  }

  public async accountsChanged(chainId: string, address: string) {
    const sessions = this.getActiveSessions()
    const eipChainId = getEip155ChainId(chainId)

    await Promise.all(
      Object.keys(sessions).map((topic) => {
        return this.web3Wallet?.emitSessionEvent({
          topic,
          event: {
            name: 'accountsChanged',
            data: [address],
          },
          chainId: eipChainId,
        })
      }),
    )
  }

  public async approveSession(proposal: Web3WalletTypes.SessionProposal, chainId: string, safeAddress: string) {
    assertWeb3Wallet(this.web3Wallet)

    // Actual safe chainId
    const safeChains = [getEip155ChainId(chainId)]

    const getNamespaces = (chains: Array<Eip155ChainId>, methods: string[]) => {
      return buildApprovedNamespaces({
        proposal: proposal.params,
        supportedNamespaces: {
          [EIP155]: {
            chains,
            methods,
            accounts: chains.map((chain) => `${chain}:${safeAddress}`),
            events: proposal.params.requiredNamespaces[EIP155]?.events || [],
          },
        },
      })
    }

    // Approve the session proposal
    try {
      return await this.web3Wallet.approveSession({
        id: proposal.id,
        namespaces: getNamespaces(safeChains, SAFE_COMPATIBLE_METHODS),
      })
    } catch (e) {
      // Most dapps require mainnet, but we aren't always on mainnet
      // A workaround, pretend to support all required chains
      const requiredChains = (proposal.params.requiredNamespaces[EIP155]?.chains as Array<Eip155ChainId>) || []
      const chains = safeChains.concat(requiredChains)

      const session = await this.web3Wallet.approveSession({
        id: proposal.id,
        namespaces: getNamespaces(chains, proposal.params.requiredNamespaces[EIP155].methods),
      })

      // Immediately switch to the correct chain and set the actual namespace
      try {
        await this.chainChanged(chainId)

        await this.web3Wallet.updateSession({
          topic: session.topic,
          namespaces: getNamespaces(safeChains, SAFE_COMPATIBLE_METHODS),
        })
      } catch (e) {
        // Ignore
      }

      return session
    }
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
  public onSessionPropose(onSessionPropose: (e: Web3WalletTypes.SessionProposal) => void) {
    // Subscribe to the session proposal event
    this.web3Wallet?.on('session_proposal', onSessionPropose)

    // Return the unsubscribe function
    return () => {
      this.web3Wallet?.off('session_proposal', onSessionPropose)
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
  }

  /**
   * Get active sessions
   */
  public getActiveSessions() {
    return this.web3Wallet?.getActiveSessions() || {}
  }

  /**
   * Subscribe to requests
   */
  public onRequest = (handler: (event: Web3WalletTypes.SessionRequest) => void) => {
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
