import { Core } from '@walletconnect/core'
import { Web3Wallet } from '@walletconnect/web3wallet'
import type Web3WalletType from '@walletconnect/web3wallet'
import { type Web3WalletTypes } from '@walletconnect/web3wallet'
import { SessionTypes } from '@walletconnect/types'
import { buildApprovedNamespaces } from '@walletconnect/utils'
import { IS_PRODUCTION, WC_PROJECT_ID } from '@/config/constants'
import { EIP155, SAFE_COMPATIBLE_METHODS, SAFE_WALLET_METADATA, WC_ERRORS } from './constants'

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
    if (!this.web3Wallet) {
      throw new Error('WalletConnect not initialized')
    }
    await this.web3Wallet?.core.pairing.pair({ uri })
  }

  private approveSession(proposal: Web3WalletTypes.SessionProposal, eip155Chains: string[], safeAddress: string) {
    if (!this.web3Wallet) {
      throw new Error('WalletConnect not initialized')
    }

    // If the session proposal is approved, we need to respond with the approved namespaces
    const safeEvents = proposal.params.requiredNamespaces[EIP155]?.events || []

    const accounts = eip155Chains.map((chainId) => `${chainId}:${safeAddress}`)

    const namespaces = buildApprovedNamespaces({
      proposal: proposal.params,
      supportedNamespaces: {
        [EIP155]: {
          chains: eip155Chains,
          methods: SAFE_COMPATIBLE_METHODS,
          events: safeEvents,
          accounts,
        },
      },
    })

    // Approve the session proposal
    return this.web3Wallet.approveSession({
      id: proposal.id,
      namespaces,
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
      if (!this.web3Wallet) {
        throw new Error('WalletConnect not initialized')
      }

      // Ask the user if we want to approve the session proposal
      const isApproved = await onSessionPropose(event)

      // If not approved, reject the session proposal
      if (!isApproved) {
        await this.web3Wallet.rejectSession({
          id: event.id,
          reason: {
            code: WC_ERRORS.UNSUPPORTED_CHAIN_ERROR_CODE,
            message: 'User rejected session proposal',
          },
        })
        return
      }

      let session: SessionTypes.Struct | null = null

      const eip155Chain = `${EIP155}:${chainId}`

      try {
        session = await this.approveSession(event, [eip155Chain], safeAddress)
      } catch {
        session = await this.approveSession(
          event,
          [eip155Chain, ...(event.params.requiredNamespaces[EIP155].chains ?? [])],
          safeAddress,
        )
      }

      // If approved, call the onSessionApprove callback
      onSessionApprove(session)
    }

    // Subscribe to the session proposal event
    this.web3Wallet?.on('session_proposal', handler)

    // Return the unsubscribe function
    return () => this.web3Wallet?.off('session_proposal', handler)
  }

  /**
   * Get active sessions
   */
  public getActiveSessions() {
    return this.web3Wallet?.getActiveSessions()
  }
}

export default WalletConnectWallet
