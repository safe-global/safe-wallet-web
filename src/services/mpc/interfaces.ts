import type { COREKIT_STATUS, UserInfo } from '@web3auth/mpc-core-kit'

export interface ISocialWalletService {
  /**
   * Opens a popup with the Google login and creates / restores the mpc wallet.
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

  /**
   * Exports the key of the signer
   *
   * @param password recovery password
   */
  exportSignerKey(password: string): Promise<string>

  /**
   * Returns true if MFA is enabled
   */
  isMFAEnabled(): boolean

  /**
   * Enables MFA and stores a device share with 2 factors:
   * - one factor encrypted with the password
   * - one factor encrypted with a key in the local storage of the browser
   *
   * @param oldPassword required if MFA is already enabled
   * @param newPassword new password to set
   */
  enableMFA(oldPassword: string | undefined, newPassword: string): Promise<void>

  isRecoveryPasswordSet(): boolean

  getUserInfo(): UserInfo | undefined

  setOnConnect(onConnect: () => Promise<void>): void
}
