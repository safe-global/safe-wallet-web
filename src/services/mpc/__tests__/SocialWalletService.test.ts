import { act, waitFor } from '@/tests/test-utils'
import {
  COREKIT_STATUS,
  type UserInfo,
  type OauthLoginParams,
  type Web3AuthMPCCoreKit,
  type TssSecurityQuestion,
} from '@web3auth/mpc-core-kit'
import * as mpcCoreKit from '@web3auth/mpc-core-kit'
import * as socialWalletOptions from '@/services/mpc/config'
import { ethers } from 'ethers'
import BN from 'bn.js'
import SocialWalletService from '../SocialWalletService'

/** time until mock login resolves */
const MOCK_LOGIN_TIME = 1000

/**
 * Helper class for mocking MPC Core Kit login flow
 */
class MockMPCCoreKit {
  status: COREKIT_STATUS = COREKIT_STATUS.INITIALIZED
  state: {
    userInfo: UserInfo | undefined
  } = {
    userInfo: undefined,
  }

  private stateAfterLogin: COREKIT_STATUS
  private userInfoAfterLogin: UserInfo | undefined
  private expectedFactorKey: BN
  private expectedKeyDetails: { shareDescriptions: Record<string, string[]> }
  /**
   *
   * @param stateAfterLogin State after loginWithOauth resolves
   * @param userInfoAfterLogin  User info to set in the state after loginWithOauth resolves
   * @param expectedFactorKey For MFA login flow the expected factor key. If inputFactorKey gets called with the expected factor key the state switches to logged in
   */
  constructor(
    stateAfterLogin: COREKIT_STATUS,
    userInfoAfterLogin: UserInfo,
    expectedFactorKey: BN = new BN(-1),
    expectedKeyDetails = { shareDescriptions: {} },
  ) {
    this.stateAfterLogin = stateAfterLogin
    this.userInfoAfterLogin = userInfoAfterLogin
    this.expectedFactorKey = expectedFactorKey
    this.expectedKeyDetails = expectedKeyDetails
  }

  loginWithOauth(params: OauthLoginParams): Promise<void> {
    return new Promise((resolve) => {
      // Resolve after 1 sec
      setTimeout(() => {
        this.status = this.stateAfterLogin
        this.state.userInfo = this.userInfoAfterLogin
        resolve()
      }, MOCK_LOGIN_TIME)
    })
  }

  inputFactorKey(factorKey: BN) {
    if (factorKey.eq(this.expectedFactorKey)) {
      this.status = COREKIT_STATUS.LOGGED_IN
      return Promise.resolve()
    } else {
      Promise.reject()
    }
  }

  commitChanges = jest.fn().mockImplementation(() => Promise.resolve())

  getUserInfo() {
    return this.state.userInfo
  }

  getKeyDetails() {
    return this.expectedKeyDetails
  }
}

describe('useMPCWallet', () => {
  beforeAll(() => {
    jest.useFakeTimers()
  })
  beforeEach(() => {
    jest.resetAllMocks()
    jest.spyOn(socialWalletOptions, 'isSocialWalletOptions').mockReturnValue(true)
  })
  afterAll(() => {
    jest.useRealTimers()
  })

  describe('triggerLogin', () => {
    it('should handle successful log in for SFA account', async () => {
      const mockOnConnect = jest.fn()

      const mockCoreKit = new MockMPCCoreKit(
        COREKIT_STATUS.LOGGED_IN,
        {
          email: 'test@test.com',
          name: 'Test',
        } as unknown as UserInfo,
        new BN(-1),
        {
          shareDescriptions: {
            1: [
              JSON.stringify({
                dateAdded: Date.now() - 30 * 24 * 60 * 60 * 60 * 1000,
                module: 'hashedShare',
              }),
            ],
          },
        },
      ) as unknown as Web3AuthMPCCoreKit

      const testService = new SocialWalletService(mockCoreKit)
      testService.setOnConnect(mockOnConnect)

      let status: Promise<COREKIT_STATUS>
      act(() => {
        status = testService.loginAndCreate()
      })

      expect(mockOnConnect).not.toHaveBeenCalled()

      // Resolve mock login
      act(() => {
        jest.advanceTimersByTime(MOCK_LOGIN_TIME)
      })

      // We should be logged in and onboard should get connected
      await waitFor(() => {
        expect(status).resolves.toEqual(COREKIT_STATUS.LOGGED_IN)
        expect(mockOnConnect).toHaveBeenCalled()
        expect(mockCoreKit.commitChanges).toHaveBeenCalled()
      })
    })

    it('should not allow logins to newly created SFA accounts', async () => {
      const mockOnConnect = jest.fn()

      const mockCoreKit = new MockMPCCoreKit(
        COREKIT_STATUS.LOGGED_IN,
        {
          email: 'test@test.com',
          name: 'Test',
        } as unknown as UserInfo,
        new BN(-1),
        {
          shareDescriptions: {
            1: [
              JSON.stringify({
                dateAdded: Date.now() - 5,
                module: 'hashedShare',
              }),
            ],
          },
        },
      ) as unknown as Web3AuthMPCCoreKit

      const testService = new SocialWalletService(mockCoreKit)
      testService.setOnConnect(mockOnConnect)

      let status: Promise<COREKIT_STATUS>
      act(() => {
        status = testService.loginAndCreate()
      })

      expect(mockOnConnect).not.toHaveBeenCalled()

      // Resolve mock login
      act(() => {
        jest.advanceTimersByTime(MOCK_LOGIN_TIME)
      })

      // We should be logged in and onboard should get connected
      await waitFor(() => {
        expect(status).rejects.toEqual(
          new Error('Social Login is deprecated and will be removed on 01.05.2024. New accounts cannot be created.'),
        )
        expect(mockOnConnect).not.toHaveBeenCalled()
        expect(mockCoreKit.commitChanges).not.toHaveBeenCalled()
      })
    })

    it('should handle successful log in for MFA account with device share', async () => {
      const mockOnConnect = jest.fn()

      const mockDeviceFactor = ethers.Wallet.createRandom().privateKey.slice(2)

      const mockCoreKit = new MockMPCCoreKit(
        COREKIT_STATUS.REQUIRED_SHARE,
        {
          email: 'test@test.com',
          name: 'Test',
        } as unknown as UserInfo,
        new BN(mockDeviceFactor, 'hex'),
      ) as unknown as Web3AuthMPCCoreKit

      jest.spyOn(mpcCoreKit, 'getWebBrowserFactor').mockReturnValue(Promise.resolve(mockDeviceFactor))

      const testService = new SocialWalletService(mockCoreKit)
      testService.setOnConnect(mockOnConnect)

      let status: Promise<COREKIT_STATUS>
      act(() => {
        status = testService.loginAndCreate()
      })

      // While the login resolves we are in Authenticating state
      expect(mockOnConnect).not.toHaveBeenCalled()

      // Resolve mock login
      act(() => {
        jest.advanceTimersByTime(MOCK_LOGIN_TIME)
      })

      // We should be logged in and onboard should get connected
      await waitFor(() => {
        expect(status).resolves.toEqual(COREKIT_STATUS.LOGGED_IN)
        expect(mockOnConnect).toHaveBeenCalled()
        expect(mockCoreKit.commitChanges).toHaveBeenCalled()
      })
    })

    it('should require manual share for MFA account without device share', async () => {
      const mockOnConnect = jest.fn()
      const mockCoreKit = new MockMPCCoreKit(COREKIT_STATUS.REQUIRED_SHARE, {
        email: 'test@test.com',
        name: 'Test',
      } as unknown as UserInfo) as unknown as Web3AuthMPCCoreKit

      jest.spyOn(mpcCoreKit, 'getWebBrowserFactor').mockReturnValue(Promise.resolve(undefined))
      jest.spyOn(mpcCoreKit, 'TssSecurityQuestion').mockReturnValue({
        getQuestion: () => 'SOME RANDOM QUESTION',
      } as unknown as TssSecurityQuestion)

      const testService = new SocialWalletService(mockCoreKit)
      testService.setOnConnect(mockOnConnect)

      let status: Promise<COREKIT_STATUS>
      act(() => {
        status = testService.loginAndCreate()
      })

      // Resolve mock login
      act(() => {
        jest.advanceTimersByTime(MOCK_LOGIN_TIME)
      })

      // A missing second factor should result in manual recovery state
      await waitFor(() => {
        expect(status).resolves.toEqual(COREKIT_STATUS.REQUIRED_SHARE)
        expect(mockOnConnect).not.toHaveBeenCalled()
        expect(mockCoreKit.commitChanges).not.toHaveBeenCalled()
      })
    })
  })

  describe('resetAccount', () => {
    it('should reset an account by overwriting the metadata', async () => {
      const mockSetMetadata = jest.fn()
      const mockMPCCore = {
        metadataKey: ethers.Wallet.createRandom().privateKey.slice(2),
        state: {
          userInfo: undefined,
        },
        tKey: {
          storageLayer: {
            setMetadata: mockSetMetadata,
          },
        },
      }

      const testService = new SocialWalletService(mockMPCCore as unknown as Web3AuthMPCCoreKit)

      await testService.__deleteAccount()

      expect(mockSetMetadata).toHaveBeenCalledWith({
        privKey: new BN(mockMPCCore.metadataKey, 'hex'),
        input: { message: 'KEY_NOT_FOUND' },
      })
    })
  })

  describe('recoverFactorWithPassword', () => {
    it('should not recover if wrong password is entered', () => {
      const mockOnConnect = jest.fn()
      const mockMPCCore = {
        state: {
          userInfo: undefined,
        },
        commitChanges: jest.fn(),
      } as unknown as Web3AuthMPCCoreKit

      jest.spyOn(mpcCoreKit, 'TssSecurityQuestion').mockReturnValue({
        getQuestion: () => 'SOME RANDOM QUESTION',
        recoverFactor: () => {
          throw new Error('Invalid answer')
        },
      } as unknown as TssSecurityQuestion)

      const testService = new SocialWalletService(mockMPCCore as unknown as Web3AuthMPCCoreKit)
      testService.setOnConnect(mockOnConnect)

      expect(testService.recoverAccountWithPassword('test', false)).rejects.toEqual(new Error('Invalid answer'))
      expect(mockOnConnect).not.toHaveBeenCalled()
      expect(mockMPCCore.commitChanges).not.toHaveBeenCalled()
    })

    it('should input recovered factor if correct password is entered', async () => {
      const mockOnConnect = jest.fn()
      const mockSecurityQuestionFactor = ethers.Wallet.createRandom().privateKey.slice(2)

      const mockMPCCore = new MockMPCCoreKit(
        COREKIT_STATUS.REQUIRED_SHARE,
        {
          email: 'test@test.com',
          name: 'Test',
        } as unknown as UserInfo,
        new BN(mockSecurityQuestionFactor, 'hex'),
      ) as unknown as Web3AuthMPCCoreKit

      jest.spyOn(mpcCoreKit, 'TssSecurityQuestion').mockReturnValue({
        getQuestion: () => 'SOME RANDOM QUESTION',
        recoverFactor: () => Promise.resolve(mockSecurityQuestionFactor),
      } as unknown as TssSecurityQuestion)

      const testService = new SocialWalletService(mockMPCCore as unknown as Web3AuthMPCCoreKit)
      testService.setOnConnect(mockOnConnect)

      act(() => testService.recoverAccountWithPassword('test', false))

      await waitFor(() => {
        expect(mockOnConnect).toHaveBeenCalled()
      })
    })
  })
})
