import { COREKIT_STATUS, getWebBrowserFactor, type Web3AuthMPCCoreKit } from '@web3auth/mpc-core-kit'
import BN from 'bn.js'
import { GOOGLE_CLIENT_ID, WEB3AUTH_VERIFIER_ID } from '@/config/constants'
import { SecurityQuestionRecovery } from '@/hooks/wallets/mpc/recovery/SecurityQuestionRecovery'
import { trackEvent } from '@/services/analytics'
import { MPC_WALLET_EVENTS } from '@/services/analytics/events/mpcWallet'
import { MPCWalletState } from '@/hooks/wallets/mpc/useMPCWallet'
import { DeviceShareRecovery } from '@/hooks/wallets/mpc/recovery/DeviceShareRecovery'

export interface ISocialWalletService {
  /**
   * Opens a pop up with the google login and creates / restores the mpc wallet.
   *
   * @returns the follow up status of the mpcCoreKit.
   */
  loginAndCreate(onConnect: () => Promise<void>): Promise<COREKIT_STATUS>

  /**
   * Deletes the currently logged in account.
   * This should only be used in dev environments and never in prod!
   */
  __deleteAccount(): void

  /**
   * Tries to recover a social signer through the Security Questions module
   *
   * @param onConnect
   * @param password entered recovery password
   * @param storeDeviceFactor if true a device factor will be added after successful recovery
   */
  recoverAccountWithPassword(
    onConnect: () => Promise<void>,
    password: string,
    storeDeviceFactor: boolean,
  ): Promise<boolean>
}

/**
 * Singleton Service for accessing the social login wallet
 */
class SocialWalletService implements ISocialWalletService {
  private mpcCoreKit: Web3AuthMPCCoreKit

  public walletState: MPCWalletState

  constructor(mpcCoreKit: Web3AuthMPCCoreKit) {
    this.mpcCoreKit = mpcCoreKit
    this.walletState = MPCWalletState.NOT_INITIALIZED
  }

  setWalletState(newState: MPCWalletState) {
    this.walletState = newState
  }

  getUserInfo() {
    return this.mpcCoreKit.getUserInfo()
  }

  async loginAndCreate(onConnect: () => Promise<void>): Promise<COREKIT_STATUS> {
    try {
      this.walletState = MPCWalletState.AUTHENTICATING
      await this.mpcCoreKit.loginWithOauth({
        subVerifierDetails: {
          typeOfLogin: 'google',
          verifier: WEB3AUTH_VERIFIER_ID,
          clientId: GOOGLE_CLIENT_ID,
        },
      })

      if (this.mpcCoreKit.status === COREKIT_STATUS.REQUIRED_SHARE) {
        // Check if we have a device share stored
        const deviceFactor = await getWebBrowserFactor(this.mpcCoreKit)
        if (deviceFactor) {
          // Recover from device factor
          const deviceFactorKey = new BN(deviceFactor, 'hex')
          await this.mpcCoreKit.inputFactorKey(deviceFactorKey)
        } else {
          // Check password recovery
          const securityQuestions = new SecurityQuestionRecovery(this.mpcCoreKit)
          if (securityQuestions.isEnabled()) {
            trackEvent(MPC_WALLET_EVENTS.MANUAL_RECOVERY)
            this.walletState = MPCWalletState.MANUAL_RECOVERY
            return this.mpcCoreKit.status
          }
        }
      }

      await this.finalizeLogin(onConnect)
      return this.mpcCoreKit.status
    } catch (error) {
      this.walletState = MPCWalletState.NOT_INITIALIZED
      console.error(error)
      return this.mpcCoreKit.status
    }
  }

  private async finalizeLogin(onConnect: () => Promise<void>) {
    if (this.mpcCoreKit.status === COREKIT_STATUS.LOGGED_IN) {
      await this.mpcCoreKit.commitChanges()

      await onConnect()

      this.walletState = MPCWalletState.READY
    }
  }

  async recoverAccountWithPassword(
    onConnect: () => Promise<void>,
    password: string,
    storeDeviceShare: boolean = false,
  ) {
    const securityQuestions = new SecurityQuestionRecovery(this.mpcCoreKit)

    if (securityQuestions.isEnabled()) {
      const factorKeyString = await securityQuestions.recoverWithPassword(password)
      const factorKey = new BN(factorKeyString, 'hex')
      await this.mpcCoreKit.inputFactorKey(factorKey)

      if (storeDeviceShare) {
        const deviceShareRecovery = new DeviceShareRecovery(this.mpcCoreKit)
        await deviceShareRecovery.createAndStoreDeviceFactor()
      }

      await this.finalizeLogin(onConnect)
    }

    return this.mpcCoreKit.status === COREKIT_STATUS.LOGGED_IN
  }

  async __deleteAccount() {
    // This is a critical function that should only be used for testing purposes
    // Resetting your account means clearing all the metadata associated with it from the metadata server
    // The key details will be deleted from our server and you will not be able to recover your account
    if (!this.mpcCoreKit?.metadataKey) {
      throw new Error('MPC Core Kit is not initialized or the user is not logged in')
    }

    // In web3auth an account is reset by overwriting the metadata with KEY_NOT_FOUND
    await this.mpcCoreKit.tKey.storageLayer.setMetadata({
      privKey: new BN(this.mpcCoreKit.metadataKey, 'hex'),
      input: { message: 'KEY_NOT_FOUND' },
    })
  }
}

export default SocialWalletService
