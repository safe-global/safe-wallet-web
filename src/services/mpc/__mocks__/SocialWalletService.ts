import { COREKIT_STATUS } from '@web3auth/mpc-core-kit'
import { type ISocialWalletService } from '../SocialWalletService'

/**
 * Manual mock for SocialWalletService
 *
 * By default it will log in the user after a 1 second timer.
 * For password recovery it expects the password to be "Test1234!"
 */
class TestSocialWalletService implements ISocialWalletService {
  private MOCK_LOGIN_TIME = 1000
  private fakePassword = 'Test1234!'
  private postLoginState = COREKIT_STATUS.LOGGED_IN

  private static SINGLETON = new TestSocialWalletService()

  static getInstance() {
    return TestSocialWalletService.SINGLETON
  }

  /**
   * Method for tests to set the expected login state after calling loginAndCreate()
   */
  __setPostLoginState(state: COREKIT_STATUS) {
    this.postLoginState = state
  }

  loginAndCreate(): Promise<COREKIT_STATUS> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.postLoginState)
      }, this.MOCK_LOGIN_TIME)
    })
  }

  __deleteAccount(): void {
    throw new Error('Method not implemented.')
  }
  recoverAccountWithPassword(password: string, storeDeviceFactor: boolean): Promise<boolean> {
    if (this.fakePassword === password) {
      return Promise.resolve(true)
    }

    throw Error('Invalid Password')
  }
}

export default TestSocialWalletService
