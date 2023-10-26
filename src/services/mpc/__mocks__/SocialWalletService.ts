import { COREKIT_STATUS, type UserInfo } from '@web3auth/mpc-core-kit'
import { hexZeroPad } from 'ethers/lib/utils'
import { MPCWalletState, type ISocialWalletService } from '../interfaces'

/**
 * Manual mock for SocialWalletService
 *
 * By default it will log in the user after a 1 second timer.
 * For password recovery it expects the password to be "Test1234!"
 */
class TestSocialWalletService implements ISocialWalletService {
  private fakePassword = 'Test1234!'
  private postLoginState = COREKIT_STATUS.LOGGED_IN
  public walletState = MPCWalletState.NOT_INITIALIZED
  private _isMfaEnabled = false
  private onConnect: () => Promise<void> = () => Promise.resolve()
  private userInfo: UserInfo = {
    email: 'test@testermann.com',
    name: 'Test Testermann',
    profileImage: 'test.testermann.local/profile.png',
  } as unknown as UserInfo

  setOnConnect(onConnect: () => Promise<void>): void {
    this.onConnect = onConnect
  }

  getUserInfo(): UserInfo | undefined {
    if (this.walletState !== MPCWalletState.READY) {
      return undefined
    }
    return this.userInfo
  }
  isMFAEnabled(): boolean {
    return this._isMfaEnabled
  }
  enableMFA(oldPassword: string, newPassword: string): Promise<void> {
    this._isMfaEnabled = true
    return Promise.resolve()
  }
  isRecoveryPasswordSet(): boolean {
    throw new Error('Method not implemented.')
  }

  /**
   * Method for tests to set the expected login state after calling loginAndCreate()
   */
  __setPostLoginState(state: COREKIT_STATUS) {
    this.postLoginState = state
  }

  __setUserInfo(userInfo: UserInfo) {
    this.userInfo = userInfo
  }

  async loginAndCreate(): Promise<COREKIT_STATUS> {
    return new Promise((resolve) => {
      this.walletState = MPCWalletState.AUTHENTICATING
      this.walletState =
        this.postLoginState === COREKIT_STATUS.LOGGED_IN ? MPCWalletState.READY : MPCWalletState.MANUAL_RECOVERY
      this.onConnect().then(() => resolve(this.postLoginState))
    })
  }

  __deleteAccount(): void {
    throw new Error('Method not implemented.')
  }
  async recoverAccountWithPassword(password: string, storeDeviceFactor: boolean): Promise<boolean> {
    if (this.fakePassword === password) {
      this.walletState = MPCWalletState.READY
      await this.onConnect()
      return true
    }

    throw Error('Invalid Password')
  }

  exportSignerKey(password: string): Promise<string> {
    if (this.walletState === MPCWalletState.READY) {
      return Promise.resolve(hexZeroPad('0x1', 20))
    }

    throw new Error('Cannot export account if not logged in')
  }

  setWalletState(state: MPCWalletState): void {
    this.walletState = state
  }
}

export default TestSocialWalletService
