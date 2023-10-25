import { type Web3AuthMPCCoreKit, type COREKIT_STATUS } from '@web3auth/mpc-core-kit'
import BN from 'bn.js'

export interface ISocialWalletService {
  /**
   * Opens a pop up with the google login and creates / restores the mpc wallet.
   *
   * @returns the follow up status of the mpcCoreKit.
   */
  loginAndCreate(): Promise<COREKIT_STATUS>

  /**
   * Deletes the currently logged in account.
   * This should only be used in dev environments and never in prod!
   */
  __deleteAccount(): void

  /**
   * Tries to recover a social signer through the Security Questions module
   *
   * @param password entered recovery password
   * @param storeDeviceFactor if true a device factor will be added after successful recovery
   */
  recoverAccountWithPassword(password: string, storeDeviceFactor: boolean): Promise<boolean>
}

/**
 * Singleton Service for accessing the social login wallet
 */
class SocialWalletService implements ISocialWalletService {
  private mpcCoreKit: Web3AuthMPCCoreKit

  constructor(mpcCoreKit: Web3AuthMPCCoreKit) {
    this.mpcCoreKit = mpcCoreKit
  }

  async loginAndCreate(): Promise<COREKIT_STATUS> {
    throw new Error('Method not implemented.')
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

  recoverAccountWithPassword(password: string, storeDeviceFactor: boolean): Promise<boolean> {
    throw new Error('Method not implemented.')
  }
}

export default SocialWalletService
