import { act, waitFor } from '@/tests/test-utils'
import {
  COREKIT_STATUS,
  type UserInfo,
  type OauthLoginParams,
  type Web3AuthMPCCoreKit,
  type TssSecurityQuestion,
  generateFactorKey,
  BrowserStorage,
} from '@web3auth/mpc-core-kit'
import * as mpcCoreKit from '@web3auth/mpc-core-kit'
import * as socialWalletOptions from '@/services/mpc/config'
import { ethers } from 'ethers'
import BN from 'bn.js'
import SocialWalletService from '../SocialWalletService'
import { SMS_OTP_MODULE_NAME } from '../recovery/SmsOtpRecovery'
import EncryptionUtil from '../EncryptionUtil'
import { type Point } from '@tkey-mpc/common-types'
import { getMfaStore, MultiFactorType } from '@/hooks/wallets/mpc/useSocialWallet'
import { hexZeroPad } from 'ethers/lib/utils'

/** time until mock login resolves */
const MOCK_LOGIN_TIME = 1000

/**
 * Mock ecsign as it leads to errors because of a mismatch of the Uint8Array type
 * Related to this: https://github.com/jestjs/jest/issues/7780
 */
jest.mock('ethereumjs-util', () => ({
  ...jest.requireActual('ethereumjs-util'),
  ecsign: () => ({
    v: 27,
    r: Buffer.from(hexZeroPad('0x123', 32), 'hex'),
    s: Buffer.from(hexZeroPad('0x456', 32), 'hex'),
  }),
}))

const setupFetchSuccessStub = (data: any) => (_url: string) => {
  return Promise.resolve({
    json: () => Promise.resolve(data),
    status: 200,
    ok: true,
  })
}

const setupFetchErrorStub = (data: any) => (_url: string) => {
  return Promise.resolve({
    json: () => Promise.resolve(data),
    status: 400,
    ok: false,
  })
}

/**
 * Helper class for mocking MPC Core Kit login flow
 */
class MockMPCCoreKit {
  status: COREKIT_STATUS = COREKIT_STATUS.INITIALIZED
  state: {
    userInfo: UserInfo | undefined
    oAuthKey: string | undefined
  } = {
    userInfo: undefined,
    oAuthKey: undefined,
  }

  tKey = {
    metadata: {
      generalStore: {
        shareDescriptions: {} as Record<string, string[]>,
      },
      pubKey: undefined as undefined | Point,
    },
    privKey: undefined as undefined | BN,
  }

  private stateAfterLogin: COREKIT_STATUS
  private userInfoAfterLogin: UserInfo | undefined
  private expectedFactorKey: BN
  /**
   *
   * @param stateAfterLogin State after loginWithOauth resolves
   * @param userInfoAfterLogin  User info to set in the state after loginWithOauth resolves
   * @param expectedFactorKey For MFA login flow the expected factor key. If inputFactorKey gets called with the expected factor key the state switches to logged in
   */
  constructor(stateAfterLogin: COREKIT_STATUS, userInfoAfterLogin: UserInfo, expectedFactorKey: BN = new BN(-1)) {
    this.stateAfterLogin = stateAfterLogin
    this.userInfoAfterLogin = userInfoAfterLogin
    this.expectedFactorKey = expectedFactorKey

    const metaDataKey = generateFactorKey()
    const oAuthKey = generateFactorKey()

    this.state.oAuthKey = oAuthKey.private.toString('hex')
    this.tKey.metadata.pubKey = metaDataKey.pub
    this.tKey.privKey = metaDataKey.private
  }

  /** Helper function to mock a share description */
  addShareDescription(factorKeyPub: Point, data: string) {
    this.tKey.metadata.generalStore.shareDescriptions[`${factorKeyPub.x}${factorKeyPub.y}`] = [data]
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

  getKeyDetails = () => {
    return { shareDescriptions: this.tKey.metadata.generalStore.shareDescriptions }
  }

  commitChanges = jest.fn().mockImplementation(() => Promise.resolve())

  createFactor = jest.fn().mockImplementation((input) => Promise.resolve(input.factorKey.toString('hex')))

  enableMFA = jest.fn().mockImplementation(() => Promise.resolve())

  getUserInfo() {
    return this.state.userInfo
  }
}

describe('SocialWalletService', () => {
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

      const mockCoreKit = new MockMPCCoreKit(COREKIT_STATUS.LOGGED_IN, {
        email: 'test@test.com',
        name: 'Test',
      } as unknown as UserInfo) as unknown as Web3AuthMPCCoreKit

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

  describe('recoverUsingSms', () => {
    it('should not recover if wrong code is entered', () => {
      const factorKey = generateFactorKey()
      const metaDataKey = generateFactorKey()
      const oAuthKey = generateFactorKey()
      const mockOnConnect = jest.fn()
      BrowserStorage.getInstance('mpc_corekit_store').set('sms_tracking_id', '123')
      const mockMPCCore = {
        state: {
          userInfo: undefined,
          oAuthKey: oAuthKey.private.toString('hex'),
        },
        tKey: {
          metadata: {
            generalStore: {
              shareDescriptions: {
                [`${factorKey.pub.x}${factorKey.pub.y}`]: [
                  JSON.stringify({
                    module: SMS_OTP_MODULE_NAME,
                    number: '+40 170 69 420',
                  }),
                ],
              } as Record<string, object>,
            },
            pubKey: metaDataKey.pub,
          },
        },
        commitChanges: jest.fn(),
      } as unknown as Web3AuthMPCCoreKit

      global.fetch = jest.fn().mockImplementation(
        setupFetchErrorStub({
          message: 'OTP is invalid',
        }),
      )
      const mockFetch = jest.spyOn(global, 'fetch')

      const testService = new SocialWalletService(mockMPCCore as unknown as Web3AuthMPCCoreKit)
      testService.setOnConnect(mockOnConnect)

      expect(testService.recoverAccountWithSms('+40 170 69 420', '123456', false)).rejects.toEqual(
        new Error('OTP is invalid'),
      )
      expect(mockOnConnect).not.toHaveBeenCalled()
      expect(mockMPCCore.commitChanges).not.toHaveBeenCalled()
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('should recover if correct code is entered', async () => {
      const factorKey = generateFactorKey()

      const mockOnConnect = jest.fn()

      BrowserStorage.getInstance('mpc_corekit_store').set('sms_tracking_id', '123')
      const mockMPCCore = new MockMPCCoreKit(
        COREKIT_STATUS.REQUIRED_SHARE,
        {
          email: 'test@test.com',
          name: 'Test',
        } as unknown as UserInfo,
        factorKey.private,
      )
      // Add share description for SMS Module
      mockMPCCore.addShareDescription(
        factorKey.pub,
        JSON.stringify({
          module: SMS_OTP_MODULE_NAME,
          number: '+40 170 69 420',
        }),
      )

      const encryptionUtil = new EncryptionUtil(new BN(mockMPCCore.state.oAuthKey!, 'hex'))
      const encryptedFactorKey = await encryptionUtil.encrypt({ factorKey: factorKey.private })
      global.fetch = jest.fn().mockImplementation(
        setupFetchSuccessStub({
          data: encryptedFactorKey,
          success: true,
        }),
      )
      const mockFetch = jest.spyOn(global, 'fetch')

      const testService = new SocialWalletService(mockMPCCore as unknown as Web3AuthMPCCoreKit)
      testService.setOnConnect(mockOnConnect)

      const result = await testService.recoverAccountWithSms('+40 170 69 420', '123456', false)
      expect(result).toBeTruthy()
      expect(mockOnConnect).toHaveBeenCalled()
      expect(mockMPCCore.commitChanges).toHaveBeenCalled()
      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(getMfaStore()).toEqual({
        sms: {
          type: MultiFactorType.SMS,
          number: '+40 170 69 420',
        },
        password: undefined,
      })
    })
  })

  describe('registerSmsOtp', () => {
    it('should trigger register and start verification and store tracking_id if not registered yet', async () => {
      const mockMPCCore = new MockMPCCoreKit(COREKIT_STATUS.LOGGED_IN, {
        email: 'test@test.com',
        name: 'Test',
      } as unknown as UserInfo)

      // mock login
      mockMPCCore.loginWithOauth({} as OauthLoginParams)
      jest.advanceTimersByTime(MOCK_LOGIN_TIME)

      global.fetch = jest.fn().mockImplementation((_url: string) => {
        if (_url.endsWith('start')) {
          return Promise.resolve({
            json: () =>
              Promise.resolve({
                success: true,
                tracking_id: '456',
              }),
            status: 200,
            ok: true,
          })
        }
        if (_url.endsWith('register')) {
          return Promise.resolve({
            json: () =>
              Promise.resolve({
                success: true,
              }),
            status: 200,
            ok: true,
          })
        }
      })

      const mockFetch = jest.spyOn(global, 'fetch')

      const testService = new SocialWalletService(mockMPCCore as unknown as Web3AuthMPCCoreKit)
      const result = await testService.registerSmsOtp('+40 176 420 69')
      expect(result).toBeTruthy()

      const storage = BrowserStorage.getInstance('mpc_corekit_store')
      expect(storage.get('sms_tracking_id')).toEqual('456')
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('should only trigger start verification and store tracking_id if already registered', async () => {
      const mockMPCCore = new MockMPCCoreKit(COREKIT_STATUS.LOGGED_IN, {
        email: 'test@test.com',
        name: 'Test',
      } as unknown as UserInfo)

      const factorKey = generateFactorKey()

      // Add share description for SMS Module
      mockMPCCore.addShareDescription(
        factorKey.pub,
        JSON.stringify({
          module: SMS_OTP_MODULE_NAME,
          number: '+40 170 69 420',
        }),
      )

      // mock login
      mockMPCCore.loginWithOauth({} as OauthLoginParams)
      jest.advanceTimersByTime(MOCK_LOGIN_TIME)

      global.fetch = jest.fn().mockImplementation((_url: string) => {
        if (_url.endsWith('start')) {
          return Promise.resolve({
            json: () =>
              Promise.resolve({
                success: true,
                tracking_id: '456',
              }),
            status: 200,
            ok: true,
          })
        }
        throw new Error('Not implemented!')
      })

      const mockFetch = jest.spyOn(global, 'fetch')

      const testService = new SocialWalletService(mockMPCCore as unknown as Web3AuthMPCCoreKit)
      const result = await testService.registerSmsOtp('+40 176 420 69')
      expect(result).toBeTruthy()

      const storage = BrowserStorage.getInstance('mpc_corekit_store')
      expect(storage.get('sms_tracking_id')).toEqual('456')
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })
  })

  describe('verifySmsOtp', () => {
    it('should not add a factor if verification fails', async () => {
      const mockMPCCore = new MockMPCCoreKit(COREKIT_STATUS.LOGGED_IN, {
        email: 'test@test.com',
        name: 'Test',
      } as unknown as UserInfo)

      const factorKey = generateFactorKey()

      const mockHashedFactorKey = generateFactorKey()

      // Add share description for SMS Module
      mockMPCCore.addShareDescription(
        mockHashedFactorKey.pub,
        JSON.stringify({
          module: 'hashedShare',
        }),
      )

      // mock login
      mockMPCCore.loginWithOauth({} as OauthLoginParams)
      jest.advanceTimersByTime(MOCK_LOGIN_TIME)

      global.fetch = jest.fn().mockImplementation(
        setupFetchErrorStub({
          message: 'OTP invalid',
        }),
      )
      const mockFetch = jest.spyOn(global, 'fetch')

      BrowserStorage.getInstance('mpc_corekit_store').set('sms_tracking_id', '123')

      const testService = new SocialWalletService(mockMPCCore as unknown as Web3AuthMPCCoreKit)
      expect(testService.verifySmsOtp('+40 176 420 69', '123456')).rejects.toEqual(new Error('OTP invalid'))
      expect(mockMPCCore.createFactor).not.toHaveBeenCalled()

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1)
      })
    })

    it('should add a factor if verification succeds', async () => {
      const mockMPCCore = new MockMPCCoreKit(COREKIT_STATUS.LOGGED_IN, {
        email: 'test@test.com',
        name: 'Test',
      } as unknown as UserInfo)

      const factorKey = generateFactorKey()

      // mock login
      mockMPCCore.loginWithOauth({} as OauthLoginParams)
      jest.advanceTimersByTime(MOCK_LOGIN_TIME)

      const encryptionUtil = new EncryptionUtil(new BN(mockMPCCore.state.oAuthKey!, 'hex'))
      const encryptedFactorKey = await encryptionUtil.encrypt({ factorKey: factorKey.private })
      global.fetch = jest.fn().mockImplementation(
        setupFetchSuccessStub({
          data: encryptedFactorKey,
          success: true,
        }),
      )
      const mockFetch = jest.spyOn(global, 'fetch')

      const storage = BrowserStorage.getInstance('mpc_corekit_store')
      storage.set('sms_tracking_id', '123')

      const testService = new SocialWalletService(mockMPCCore as unknown as Web3AuthMPCCoreKit)
      const success = await testService.verifySmsOtp('+40 176 420 69', '123456')
      expect(mockMPCCore.createFactor).toHaveBeenCalled()
      expect(mockMPCCore.enableMFA).not.toHaveBeenCalled()
      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(storage.get('sms_tracking_id')).toBeUndefined()
    })

    it('should add a factor and enableMFA if verification succeds and MFA is not enabled yet', async () => {
      const mockMPCCore = new MockMPCCoreKit(COREKIT_STATUS.LOGGED_IN, {
        email: 'test@test.com',
        name: 'Test',
      } as unknown as UserInfo)

      const factorKey = generateFactorKey()

      const mockHashedFactorKey = generateFactorKey()

      // Add share description for SMS Module
      mockMPCCore.addShareDescription(
        mockHashedFactorKey.pub,
        JSON.stringify({
          module: 'hashedShare',
        }),
      )

      // mock login
      mockMPCCore.loginWithOauth({} as OauthLoginParams)
      jest.advanceTimersByTime(MOCK_LOGIN_TIME)

      const encryptionUtil = new EncryptionUtil(new BN(mockMPCCore.state.oAuthKey!, 'hex'))
      const encryptedFactorKey = await encryptionUtil.encrypt({ factorKey: factorKey.private })
      global.fetch = jest.fn().mockImplementation(
        setupFetchSuccessStub({
          data: encryptedFactorKey,
          success: true,
        }),
      )
      const mockFetch = jest.spyOn(global, 'fetch')

      const storage = BrowserStorage.getInstance('mpc_corekit_store')
      storage.set('sms_tracking_id', '123')

      const testService = new SocialWalletService(mockMPCCore as unknown as Web3AuthMPCCoreKit)
      const success = await testService.verifySmsOtp('+40 176 420 69', '123456')
      expect(mockMPCCore.createFactor).toHaveBeenCalled()
      expect(mockMPCCore.enableMFA).toHaveBeenCalled()
      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(storage.get('sms_tracking_id')).toBeUndefined()
    })
  })
})
