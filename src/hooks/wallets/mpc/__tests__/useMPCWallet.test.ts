import { act, renderHook, waitFor } from '@/tests/test-utils'
import { MPCWalletState, useMPCWallet } from '../useMPCWallet'
import * as useOnboard from '@/hooks/wallets/useOnboard'
import { type OnboardAPI } from '@web3-onboard/core'
import {
  COREKIT_STATUS,
  type UserInfo,
  type OauthLoginParams,
  type Web3AuthMPCCoreKit,
  type TssSecurityQuestion,
} from '@web3auth/mpc-core-kit'
import * as mpcCoreKit from '@web3auth/mpc-core-kit'
import { setMPCCoreKitInstance } from '../useMPC'
import { ONBOARD_MPC_MODULE_LABEL } from '@/services/mpc/module'
import { ethers } from 'ethers'
import BN from 'bn.js'

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
  }

  loginWithOauth(params: OauthLoginParams): Promise<void> {
    return new Promise((resolve) => {
      // Resolve after 1 sec
      setTimeout(() => {
        this.status = this.stateAfterLogin
        this.state.userInfo = this.userInfoAfterLogin
        resolve()
      }, 1000)
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
}

describe('useMPCWallet', () => {
  beforeAll(() => {
    jest.useFakeTimers()
  })
  beforeEach(() => {
    jest.resetAllMocks()
    setMPCCoreKitInstance(undefined)
  })
  afterAll(() => {
    jest.useRealTimers()
  })
  it('should have state NOT_INITIALIZED initially', () => {
    const { result } = renderHook(() => useMPCWallet())
    expect(result.current.walletState).toBe(MPCWalletState.NOT_INITIALIZED)
    expect(result.current.userInfo.email).toBeUndefined()
  })

  describe('triggerLogin', () => {
    it('should throw if Onboard is not initialized', () => {
      const { result } = renderHook(() => useMPCWallet())
      expect(result.current.triggerLogin()).rejects.toEqual(new Error('Onboard is not initialized'))
      expect(result.current.walletState).toBe(MPCWalletState.NOT_INITIALIZED)
    })

    it('should throw if MPC Core Kit is not initialized', () => {
      jest.spyOn(useOnboard, 'default').mockReturnValue({} as unknown as OnboardAPI)
      const { result } = renderHook(() => useMPCWallet())

      expect(result.current.triggerLogin()).rejects.toEqual(new Error('MPC Core Kit is not initialized'))
      expect(result.current.walletState).toBe(MPCWalletState.NOT_INITIALIZED)
    })

    it('should handle successful log in for SFA account', async () => {
      jest.spyOn(useOnboard, 'default').mockReturnValue({} as unknown as OnboardAPI)
      const connectWalletSpy = jest.fn().mockImplementation(() => Promise.resolve())
      jest.spyOn(useOnboard, 'connectWallet').mockImplementation(connectWalletSpy)
      setMPCCoreKitInstance(
        new MockMPCCoreKit(COREKIT_STATUS.LOGGED_IN, {
          email: 'test@test.com',
          name: 'Test',
        } as unknown as UserInfo) as unknown as Web3AuthMPCCoreKit,
      )
      const { result } = renderHook(() => useMPCWallet())

      act(() => {
        result.current.triggerLogin()
      })

      expect(result.current.walletState === MPCWalletState.AUTHENTICATING)
      expect(connectWalletSpy).not.toBeCalled()

      act(() => {
        jest.advanceTimersByTime(MOCK_LOGIN_TIME)
      })

      await waitFor(() => {
        expect(result.current.walletState === MPCWalletState.READY)
        expect(connectWalletSpy).toBeCalledWith(expect.anything(), {
          autoSelect: {
            label: ONBOARD_MPC_MODULE_LABEL,
            disableModals: true,
          },
        })
      })
    })

    it('should handle successful log in for MFA account with device share', async () => {
      const mockDeviceFactor = ethers.Wallet.createRandom().privateKey.slice(2)
      jest.spyOn(useOnboard, 'default').mockReturnValue({} as unknown as OnboardAPI)
      const connectWalletSpy = jest.fn().mockImplementation(() => Promise.resolve())
      jest.spyOn(useOnboard, 'connectWallet').mockImplementation(connectWalletSpy)
      setMPCCoreKitInstance(
        new MockMPCCoreKit(
          COREKIT_STATUS.REQUIRED_SHARE,
          {
            email: 'test@test.com',
            name: 'Test',
          } as unknown as UserInfo,
          new BN(mockDeviceFactor, 'hex'),
        ) as unknown as Web3AuthMPCCoreKit,
      )

      jest.spyOn(mpcCoreKit, 'getWebBrowserFactor').mockReturnValue(Promise.resolve(mockDeviceFactor))

      const { result } = renderHook(() => useMPCWallet())

      act(() => {
        result.current.triggerLogin()
      })

      expect(result.current.walletState === MPCWalletState.AUTHENTICATING)
      expect(connectWalletSpy).not.toBeCalled()
      act(() => {
        jest.advanceTimersByTime(MOCK_LOGIN_TIME)
      })

      await waitFor(() => {
        expect(result.current.walletState === MPCWalletState.READY)
        expect(connectWalletSpy).toBeCalledWith(expect.anything(), {
          autoSelect: {
            label: ONBOARD_MPC_MODULE_LABEL,
            disableModals: true,
          },
        })
      })
    })

    it('should require manual share for MFA account without device share', async () => {
      jest.spyOn(useOnboard, 'default').mockReturnValue({} as unknown as OnboardAPI)
      const connectWalletSpy = jest.fn().mockImplementation(() => Promise.resolve())
      jest.spyOn(useOnboard, 'connectWallet').mockImplementation(connectWalletSpy)
      setMPCCoreKitInstance(
        new MockMPCCoreKit(COREKIT_STATUS.REQUIRED_SHARE, {
          email: 'test@test.com',
          name: 'Test',
        } as unknown as UserInfo) as unknown as Web3AuthMPCCoreKit,
      )

      // TODO: remove unnecessary cast if mpc core sdk gets updated
      jest.spyOn(mpcCoreKit, 'getWebBrowserFactor').mockReturnValue(Promise.resolve(undefined as unknown as string))
      jest.spyOn(mpcCoreKit, 'TssSecurityQuestion').mockReturnValue({
        getQuestion: () => 'SOME RANDOM QUESTION',
      } as unknown as TssSecurityQuestion)

      const { result } = renderHook(() => useMPCWallet())

      act(() => {
        result.current.triggerLogin()
      })

      expect(result.current.walletState === MPCWalletState.AUTHENTICATING)
      expect(connectWalletSpy).not.toBeCalled()

      act(() => {
        jest.advanceTimersByTime(MOCK_LOGIN_TIME)
      })

      await waitFor(() => {
        expect(result.current.walletState === MPCWalletState.MANUAL_RECOVERY)
        expect(connectWalletSpy).not.toBeCalled()
      })
    })
  })

  describe('resetAccount', () => {
    it('should throw if mpcCoreKit is not initialized', () => {
      const { result } = renderHook(() => useMPCWallet())
      expect(result.current.resetAccount()).rejects.toEqual(
        new Error('MPC Core Kit is not initialized or the user is not logged in'),
      )
    })
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

      setMPCCoreKitInstance(mockMPCCore as unknown as Web3AuthMPCCoreKit)

      const { result } = renderHook(() => useMPCWallet())

      await result.current.resetAccount()

      expect(mockSetMetadata).toHaveBeenCalledWith({
        privKey: new BN(mockMPCCore.metadataKey, 'hex'),
        input: { message: 'KEY_NOT_FOUND' },
      })
    })
  })

  describe('recoverFactorWithPassword', () => {
    it('should throw if mpcCoreKit is not initialized', () => {
      const { result } = renderHook(() => useMPCWallet())
      expect(result.current.recoverFactorWithPassword('test', false)).rejects.toEqual(
        new Error('MPC Core Kit is not initialized'),
      )
    })

    it('should not recover if wrong password is entered', () => {
      setMPCCoreKitInstance({
        state: {
          userInfo: undefined,
        },
      } as unknown as Web3AuthMPCCoreKit)
      const { result } = renderHook(() => useMPCWallet())
      jest.spyOn(mpcCoreKit, 'TssSecurityQuestion').mockReturnValue({
        getQuestion: () => 'SOME RANDOM QUESTION',
        recoverFactor: () => {
          throw new Error('Invalid answer')
        },
      } as unknown as TssSecurityQuestion)

      expect(result.current.recoverFactorWithPassword('test', false)).rejects.toEqual(new Error('Invalid answer'))
    })

    it('should input recovered factor if correct password is entered', async () => {
      const mockSecurityQuestionFactor = ethers.Wallet.createRandom().privateKey.slice(2)
      const connectWalletSpy = jest.fn().mockImplementation(() => Promise.resolve())
      jest.spyOn(useOnboard, 'default').mockReturnValue({} as unknown as OnboardAPI)
      jest.spyOn(useOnboard, 'connectWallet').mockImplementation(connectWalletSpy)

      setMPCCoreKitInstance(
        new MockMPCCoreKit(
          COREKIT_STATUS.REQUIRED_SHARE,
          {
            email: 'test@test.com',
            name: 'Test',
          } as unknown as UserInfo,
          new BN(mockSecurityQuestionFactor, 'hex'),
        ) as unknown as Web3AuthMPCCoreKit,
      )

      const { result } = renderHook(() => useMPCWallet())
      jest.spyOn(mpcCoreKit, 'TssSecurityQuestion').mockReturnValue({
        getQuestion: () => 'SOME RANDOM QUESTION',
        recoverFactor: () => Promise.resolve(mockSecurityQuestionFactor),
      } as unknown as TssSecurityQuestion)

      act(() => result.current.recoverFactorWithPassword('test', false))

      await waitFor(() => {
        expect(result.current.walletState === MPCWalletState.READY)
        expect(connectWalletSpy).toBeCalledWith(expect.anything(), {
          autoSelect: {
            label: ONBOARD_MPC_MODULE_LABEL,
            disableModals: true,
          },
        })
      })
    })
  })
})
