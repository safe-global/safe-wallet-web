import { useState } from 'react'
import useMPC from './useMPC'
import BN from 'bn.js'
import { GOOGLE_CLIENT_ID, WEB3AUTH_VERIFIER_ID } from '@/config/constants'
import { COREKIT_STATUS, getWebBrowserFactor } from '@web3auth/mpc-core-kit'
import useOnboard, { connectWallet } from '../useOnboard'
import { ONBOARD_MPC_MODULE_LABEL } from '@/services/mpc/module'
import { SecurityQuestionRecovery } from './recovery/SecurityQuestionRecovery'
import { DeviceShareRecovery } from './recovery/DeviceShareRecovery'

export enum MPCWalletState {
  NOT_INITIALIZED,
  AUTHENTICATING,
  MANUAL_RECOVERY,
  READY,
}

export type MPCWalletHook = {
  upsertPasswordBackup: (password: string) => Promise<void>
  recoverFactorWithPassword: (password: string, storeDeviceShare: boolean) => Promise<void>
  walletState: MPCWalletState
  triggerLogin: () => Promise<void>
  resetAccount: () => Promise<void>
  userInfo: {
    email: string | undefined
    profileImage: string | undefined
    name: string | undefined
  }
}

export const useMPCWallet = (): MPCWalletHook => {
  const [walletState, setWalletState] = useState(MPCWalletState.NOT_INITIALIZED)
  const mpcCoreKit = useMPC()
  const onboard = useOnboard()

  const criticalResetAccount = async (): Promise<void> => {
    // This is a critical function that should only be used for testing purposes
    // Resetting your account means clearing all the metadata associated with it from the metadata server
    // The key details will be deleted from our server and you will not be able to recover your account
    if (!mpcCoreKit || !mpcCoreKit.metadataKey) {
      throw new Error('MPC Core Kit is not initialized or the user is not logged in')
    }

    // In web3auth an account is reset by overwriting the metadata with KEY_NOT_FOUND
    await mpcCoreKit.tKey.storageLayer.setMetadata({
      privKey: new BN(mpcCoreKit.metadataKey, 'hex'),
      input: { message: 'KEY_NOT_FOUND' },
    })
  }

  const triggerLogin = async () => {
    if (!onboard) {
      throw Error('Onboard is not initialized')
    }

    if (!mpcCoreKit) {
      throw Error('MPC Core Kit is not initialized')
    }
    try {
      setWalletState(MPCWalletState.AUTHENTICATING)
      await mpcCoreKit.loginWithOauth({
        subVerifierDetails: {
          typeOfLogin: 'google',
          verifier: WEB3AUTH_VERIFIER_ID,
          clientId: GOOGLE_CLIENT_ID,
        },
      })

      if (mpcCoreKit.status === COREKIT_STATUS.REQUIRED_SHARE) {
        // Check if we have a device share stored
        const deviceFactor = await getWebBrowserFactor(mpcCoreKit)
        if (deviceFactor) {
          // Recover from device factor
          const deviceFactorKey = new BN(deviceFactor, 'hex')
          await mpcCoreKit.inputFactorKey(deviceFactorKey)
        } else {
          // Check password recovery
          const securityQuestions = new SecurityQuestionRecovery(mpcCoreKit)
          if (securityQuestions.isEnabled()) {
            setWalletState(MPCWalletState.MANUAL_RECOVERY)
            return
          }
        }
      }

      finalizeLogin()
    } catch (error) {
      setWalletState(MPCWalletState.NOT_INITIALIZED)
      console.error(error)
    }
  }

  const finalizeLogin = () => {
    if (!mpcCoreKit || !onboard) {
      return
    }
    if (mpcCoreKit.status === COREKIT_STATUS.LOGGED_IN) {
      connectWallet(onboard, {
        autoSelect: {
          label: ONBOARD_MPC_MODULE_LABEL,
          disableModals: true,
        },
      }).catch((reason) => console.error('Error connecting to MPC module:', reason))
      setWalletState(MPCWalletState.READY)
    }
  }

  const recoverFactorWithPassword = async (password: string, storeDeviceShare: boolean = false) => {
    if (!mpcCoreKit) {
      throw new Error('MPC Core Kit is not initialized')
    }

    const securityQuestions = new SecurityQuestionRecovery(mpcCoreKit)

    if (securityQuestions.isEnabled()) {
      const factorKeyString = await securityQuestions.recoverWithPassword(password)
      const factorKey = new BN(factorKeyString, 'hex')
      await mpcCoreKit.inputFactorKey(factorKey)

      if (storeDeviceShare) {
        const deviceShareRecovery = new DeviceShareRecovery(mpcCoreKit)
        await deviceShareRecovery.createAndStoreDeviceFactor()
      }

      finalizeLogin()
    }
  }

  return {
    triggerLogin,
    walletState,
    recoverFactorWithPassword,
    resetAccount: criticalResetAccount,
    upsertPasswordBackup: () => Promise.resolve(),
    userInfo: {
      email: mpcCoreKit?.state.userInfo?.email,
      profileImage: mpcCoreKit?.state.userInfo?.profileImage,
      name: mpcCoreKit?.state.userInfo?.name,
    },
  }
}
