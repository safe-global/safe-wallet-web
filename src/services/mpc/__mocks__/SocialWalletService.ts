import { COREKIT_STATUS, type UserInfo } from '@web3auth/mpc-core-kit'
import { hexZeroPad } from 'ethers/lib/utils'
import { type ISocialWalletService } from '../interfaces'

/**
 * Manual mock for SocialWalletService
 *
 * By default it will log in the user after a 1 second timer.
 * For password recovery it expects the password to be "Test1234!"
 */
class TestSocialWalletService implements ISocialWalletService {
  upsertPassword(oldPassword: string | undefined, newPassword: string): Promise<void> {
    this.enableMFA()
    return Promise.resolve()
  }
  registerSmsOtp(mobileNumber: string): Promise<boolean> {
    return Promise.resolve(true)
  }
  verifySmsOtp(number: string, code: string): Promise<boolean> {
    this.enableMFA()
    return Promise.resolve(true)
  }
  isSmsOtpEnabled(): boolean {
    throw new Error('Method not implemented.')
  }
  getSmsRecoveryNumber(): string | undefined {
    throw new Error('Method not implemented.')
  }
  recoverAccountWithSms(number: string, code: string, storeDeviceShare: boolean): Promise<boolean> {
    throw new Error('Method not implemented.')
  }
  private fakePassword = 'Test1234!'
  private postLoginState = COREKIT_STATUS.LOGGED_IN
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
    return this.userInfo
  }
  isMFAEnabled(): boolean {
    return this._isMfaEnabled
  }
  enableMFA(): Promise<void> {
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
      this.onConnect().then(() => resolve(this.postLoginState))
    })
  }

  __deleteAccount(): void {
    throw new Error('Method not implemented.')
  }
  async recoverAccountWithPassword(password: string, storeDeviceFactor: boolean): Promise<boolean> {
    if (this.fakePassword === password) {
      await this.onConnect()
      return true
    }

    throw Error('Invalid Password')
  }

  exportSignerKey(password: string): Promise<string> {
    return Promise.resolve(hexZeroPad('0x1', 20))
  }
}

export default TestSocialWalletService
