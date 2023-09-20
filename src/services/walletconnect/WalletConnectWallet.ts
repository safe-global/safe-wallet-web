import { Core } from '@walletconnect/core'
import { Web3Wallet } from '@walletconnect/web3wallet'
import type Web3WalletType from '@walletconnect/web3wallet'
import { type Web3WalletTypes } from '@walletconnect/web3wallet'
import { SessionTypes } from '@walletconnect/types'
import { buildApprovedNamespaces } from '@walletconnect/utils'
import { IS_PRODUCTION, WC_PROJECT_ID } from '@/config/constants'
import { EIP155, SAFE_COMPATIBLE_METHODS, SAFE_WALLET_METADATA, WC_ERRORS } from './constants'

const logger = IS_PRODUCTION ? undefined : 'debug'

export class WalletConnect {
  private web3Wallet: Web3WalletType | null = null

  constructor() {
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

  public async connect(uri: string) {
    if (!this.web3Wallet) {
      throw new Error('WalletConnect not initialized')
    }
    await this.web3Wallet?.core.pairing.pair({ uri })
  }

  public addOnSessionPropose(
    chainId: string,
    safeAddress: string,
    onSessionPropose: (e: Web3WalletTypes.SessionProposal) => Promise<boolean>,
    onSessionApprove: (session: SessionTypes.Struct) => Promise<void>,
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

      // If the session proposal is approved, we need to respond with the approved namespaces
      const { requiredNamespaces } = event.params
      const safeEvents = requiredNamespaces[EIP155]?.events || []

      const namespaces = buildApprovedNamespaces({
        proposal: event.params,
        supportedNamespaces: {
          [EIP155]: {
            chains: [`${EIP155}:${chainId}`],
            methods: SAFE_COMPATIBLE_METHODS,
            events: safeEvents,
            accounts: [`${EIP155}:${chainId}:${safeAddress}`],
          },
        },
      })

      // Approve the session proposal
      const session = await this.web3Wallet.approveSession({
        id: event.id,
        namespaces,
      })

      // If approved, call the onSessionApprove callback
      onSessionApprove(session)
    }

    // Subscribe to the session proposal event
    this.web3Wallet?.on('session_proposal', handler)

    // Return the unsubscribe function
    return () => this.web3Wallet?.off('session_proposal', handler)
  }
}
