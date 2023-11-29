import { COREKIT_STATUS, type Web3AuthMPCCoreKit } from '@web3auth/mpc-core-kit'
import BN from 'bn.js'
import { SecurityQuestionRecovery } from '@/services/mpc/recovery/SecurityQuestionRecovery'
import { trackEvent } from '@/services/analytics'
import { MPC_WALLET_EVENTS } from '@/services/analytics/events/mpcWallet'
import { DeviceShareRecovery } from '@/services/mpc/recovery/DeviceShareRecovery'
import { logError } from '../exceptions'
import ErrorCodes from '../exceptions/ErrorCodes'
import { asError } from '../exceptions/utils'
import { type ISocialWalletService } from './interfaces'
import { isSocialWalletOptions, SOCIAL_WALLET_OPTIONS } from './config'
import { SmsOtpRecovery } from './recovery/SmsOtpRecovery'
import { MultiFactorType, setMfaStore, type useMfaStore } from '@/hooks/wallets/mpc/useSocialWallet'

/**
 * Singleton Service for accessing the social login wallet
 */
class SocialWalletService implements ISocialWalletService {
  private mpcCoreKit: Web3AuthMPCCoreKit
  private onConnect: () => Promise<void> = () => Promise.resolve()

  private deviceShareRecovery: DeviceShareRecovery
  private securityQuestionRecovery: SecurityQuestionRecovery
  private smsRecovery: SmsOtpRecovery

  constructor(mpcCoreKit: Web3AuthMPCCoreKit) {
    this.mpcCoreKit = mpcCoreKit
    this.deviceShareRecovery = new DeviceShareRecovery(mpcCoreKit)
    this.securityQuestionRecovery = new SecurityQuestionRecovery(mpcCoreKit)
    this.smsRecovery = new SmsOtpRecovery(mpcCoreKit)

    // In case of rehydration we need to initialize the store
    this.syncMfaSetup()
  }

  /**
   * Writes the current MFA setup into external storage so that we can trigger re-renders
   */
  private syncMfaSetup() {
    const newState: ReturnType<typeof useMfaStore> = {
      sms: undefined,
      password: undefined,
    }

    if (this.isSmsOtpEnabled()) {
      const number = this.getSmsRecoveryNumber()
      if (number) {
        newState.sms = { type: MultiFactorType.SMS, number }
      }
    }

    if (this.isRecoveryPasswordSet()) {
      newState.password = { type: MultiFactorType.PASSWORD }
    }

    setMfaStore(newState)
  }

  isMFAEnabled() {
    const { shareDescriptions } = this.mpcCoreKit.getKeyDetails()
    return !Object.values(shareDescriptions).some((value) => value[0]?.includes('hashedShare'))
  }

  isRecoveryPasswordSet() {
    return this.securityQuestionRecovery.isEnabled()
  }

  async upsertPassword(oldPassword: string | undefined, newPassword: string): Promise<void> {
    try {
      // 1. setup device factor with password recovery
      await this.securityQuestionRecovery.upsertPassword(newPassword, oldPassword)
      const securityQuestionFactor = await this.securityQuestionRecovery.recoverWithPassword(newPassword)
      if (!securityQuestionFactor) {
        throw Error('Problem setting up the new password')
      }
      // 2. enable MFA
      if (!this.isMFAEnabled()) {
        trackEvent({ ...MPC_WALLET_EVENTS.ENABLE_MFA, label: 'password' })
        await this.enableMFA()
      }

      // 3. commit
      trackEvent({ ...MPC_WALLET_EVENTS.SETUP_MFA_FACTOR, label: 'password' })
      await this.mpcCoreKit.commitChanges()
      this.syncMfaSetup()
    } catch (e) {
      const error = asError(e)
      logError(ErrorCodes._304, error.message)
      throw error
    }
  }

  async enableMFA(): Promise<void> {
    try {
      await this.mpcCoreKit.enableMFA({}, false)
    } catch (e) {
      const error = asError(e)
      logError(ErrorCodes._304, error.message)
      throw error
    }
  }

  setOnConnect(onConnect: () => Promise<void>) {
    this.onConnect = onConnect
  }

  getUserInfo() {
    return this.mpcCoreKit.state.userInfo
  }

  async loginAndCreate(): Promise<COREKIT_STATUS> {
    const config = SOCIAL_WALLET_OPTIONS
    const isConfigured = isSocialWalletOptions(config)
    if (!isConfigured) {
      throw new Error('The Social signer wallet is not configured correctly')
    }
    try {
      await this.mpcCoreKit.loginWithOauth({
        aggregateVerifierIdentifier: config.web3AuthAggregateVerifierId,
        subVerifierDetailsArray: [
          {
            clientId: config.googleClientId,
            typeOfLogin: 'google',
            verifier: config.web3AuthSubverifierId,
          },
        ],
        aggregateVerifierType: 'single_id_verifier',
      })

      // After login we need to store what recovery options are setup
      this.syncMfaSetup()

      if (this.mpcCoreKit.status === COREKIT_STATUS.REQUIRED_SHARE) {
        // Check if we have a device share stored
        if (await this.deviceShareRecovery.isEnabled()) {
          await this.deviceShareRecovery.recoverWithDeviceFactor()
        } else {
          // Check password recovery
          if (this.securityQuestionRecovery.isEnabled()) {
            trackEvent(MPC_WALLET_EVENTS.MANUAL_RECOVERY)
            return this.mpcCoreKit.status
          }
        }
      }

      await this.finalizeLogin()
      return this.mpcCoreKit.status
    } catch (err) {
      const error = asError(err)
      logError(ErrorCodes._306, error)
      throw new Error('Something went wrong. Please try to login again.')
    }
  }

  private async finalizeLogin() {
    if (this.mpcCoreKit.status === COREKIT_STATUS.LOGGED_IN) {
      await this.mpcCoreKit.commitChanges()
      this.syncMfaSetup()
      await this.onConnect()
    }
  }

  async recoverAccountWithPassword(password: string, storeDeviceShare: boolean = false) {
    if (this.securityQuestionRecovery.isEnabled()) {
      const factorKeyString = await this.securityQuestionRecovery.recoverWithPassword(password)
      const factorKey = new BN(factorKeyString, 'hex')
      await this.mpcCoreKit.inputFactorKey(factorKey)

      if (storeDeviceShare) {
        await this.deviceShareRecovery.createAndStoreDeviceFactor()
      }

      await this.finalizeLogin()
    }

    if (this.mpcCoreKit.status === COREKIT_STATUS.LOGGED_IN) {
      trackEvent({ ...MPC_WALLET_EVENTS.RECOVERED_SOCIAL_SIGNER, label: 'password' })
    }

    return this.mpcCoreKit.status === COREKIT_STATUS.LOGGED_IN
  }

  async recoverAccountWithSms(number: string, code: string, storeDeviceShare: boolean = false) {
    if (this.smsRecovery.isEnabled()) {
      const success = await this.smsRecovery.verifyNumber(number, code, false)
      if (success) {
        if (storeDeviceShare) {
          await this.deviceShareRecovery.createAndStoreDeviceFactor()
        }
        await this.finalizeLogin()
      }
    }

    if (this.mpcCoreKit.status === COREKIT_STATUS.LOGGED_IN) {
      trackEvent({ ...MPC_WALLET_EVENTS.RECOVERED_SOCIAL_SIGNER, label: 'sms' })
    }

    return this.mpcCoreKit.status === COREKIT_STATUS.LOGGED_IN
  }

  isSmsOtpEnabled(): boolean {
    return this.smsRecovery.isEnabled()
  }

  getSmsRecoveryNumber(): string | undefined {
    return this.smsRecovery.getSmsRecoveryNumber()
  }

  async registerSmsOtp(mobileNumber: string): Promise<boolean> {
    if (!this.smsRecovery.isEnabled()) {
      await this.smsRecovery.registerDevice(mobileNumber)
    }
    await this.smsRecovery.startVerification()
    return true
  }

  async verifySmsOtp(number: string, code: string): Promise<boolean> {
    const success = await this.smsRecovery.verifyNumber(number, code, !this.smsRecovery.isEnabled())

    if (success) {
      if (!this.isMFAEnabled()) {
        trackEvent({ ...MPC_WALLET_EVENTS.ENABLE_MFA, label: 'sms' })
        await this.enableMFA()
      }
      trackEvent({ ...MPC_WALLET_EVENTS.SETUP_MFA_FACTOR, label: 'sms' })

      await this.mpcCoreKit.commitChanges()
      this.syncMfaSetup()
    }

    return success
  }

  async exportSignerKey(password: string): Promise<string> {
    try {
      if (this.securityQuestionRecovery.isEnabled()) {
        // Only export PK if recovery works
        await this.securityQuestionRecovery.recoverWithPassword(password)
      }
      const exportedPK = await this.mpcCoreKit?._UNSAFE_exportTssKey()
      return exportedPK
    } catch (err) {
      throw new Error('Error exporting account. Make sure the password is correct.')
    }
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
