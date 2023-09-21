import { Core } from '@walletconnect/core'
import { Web3Wallet } from '@walletconnect/web3wallet'
import { buildApprovedNamespaces, getSdkError } from '@walletconnect/utils'
import type Web3WalletType from '@walletconnect/web3wallet'
import type { Web3WalletTypes } from '@walletconnect/web3wallet'
import type { SessionTypes } from '@walletconnect/types'

import { IS_PRODUCTION, WC_PROJECT_ID } from '@/config/constants'
import { EIP155, SAFE_COMPATIBLE_METHODS, SAFE_WALLET_METADATA } from './constants'
import { invariant } from '@/utils/helpers'

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

    await this.web3Wallet?.core.pairing.pair({ uri })
  }

  private async approveSession(proposal: Web3WalletTypes.SessionProposal, chainId: string, safeAddress: string) {
    assertWeb3Wallet(this.web3Wallet)

    // Actual safe chainId
    const safeChains = [`${EIP155}:${chainId}`]

    const getNamespaces = (chains: string[]) => {
      return buildApprovedNamespaces({
        proposal: proposal.params,
        supportedNamespaces: {
          [EIP155]: {
            chains,
            accounts: chains.map((chain) => `${chain}:${safeAddress}`),
            events: proposal.params.requiredNamespaces[EIP155]?.events || [],
            methods: SAFE_COMPATIBLE_METHODS,
          },
        },
      })
    }

    // Approve the session proposal
    try {
      return await this.web3Wallet.approveSession({
        id: proposal.id,
        namespaces: getNamespaces(safeChains),
      })
    } catch (e) {
      // Most dapps require mainnet, but we aren't always on mainnet
      // A workaround, pretend to support all required chains
      const requiredChains = proposal.params.requiredNamespaces[EIP155]?.chains || []
      const chains = safeChains.concat(requiredChains)

      const session = await this.web3Wallet.approveSession({
        id: proposal.id,
        namespaces: getNamespaces(chains),
      })

      // Immediately update the session with the actual namespaces
      try {
        await this.web3Wallet.updateSession({
          topic: session.topic,
          namespaces: getNamespaces(safeChains),
        })
      } catch (e) {
        // Ignore
      }

      return session
    }
  }

  private async rejectSession(proposal: Web3WalletTypes.SessionProposal) {
    assertWeb3Wallet(this.web3Wallet)

    await this.web3Wallet.rejectSession({
      id: proposal.id,
      reason: getSdkError('UNSUPPORTED_CHAINS'),
    })
  }

  /**
   * Subscribe to session proposals
   */
  public addOnSessionPropose(
    chainId: string,
    safeAddress: string,
    onSessionPropose: (e: Web3WalletTypes.SessionProposal) => Promise<boolean>,
    onSessionApprove: (session: SessionTypes.Struct) => void,
  ) {
    const handler = async (event: Web3WalletTypes.SessionProposal) => {
      assertWeb3Wallet(this.web3Wallet)

      // Ask the user if we want to approve the session proposal
      const isApproved = await onSessionPropose(event)

      // If not approved, reject the session proposal
      if (!isApproved) {
        await this.rejectSession(event)
        return
      }

      const session = await this.approveSession(event, chainId, safeAddress)

      // If approved, call the onSessionApprove callback
      onSessionApprove(session)
    }

    // Subscribe to the session proposal event
    this.web3Wallet?.on('session_proposal', handler)

    // Return the unsubscribe function
    return () => {
      this.web3Wallet?.off('session_proposal', handler)
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
    return this.web3Wallet?.getActiveSessions()
  }
}

export default WalletConnectWallet
