import { useState } from 'react'
import useMPC from './useMPC'
import BN from 'bn.js'
import { GOOGLE_CLIENT_ID, WEB3AUTH_VERIFIER_ID } from '@/config/constants'
import { COREKIT_STATUS } from '@web3auth/mpc-core-kit'
import useOnboard, { connectWallet } from '../useOnboard'
import { ONBOARD_MPC_MODULE_LABEL } from '@/services/mpc/module'

export enum MPCWalletState {
  NOT_INITIALIZED,
  AUTHENTICATING,
  AUTHENTICATED,
  CREATING_SECOND_FACTOR,
  RECOVERING_ACCOUNT_PASSWORD,
  CREATED_SECOND_FACTOR,
  FINALIZING_ACCOUNT,
  READY,
}

export type MPCWalletHook = {
  upsertPasswordBackup: (password: string) => Promise<void>
  recoverFactorWithPassword: (password: string) => Promise<void>
  walletState: MPCWalletState
  triggerLogin: () => Promise<void>
  resetAccount: () => Promise<void>
  userInfo: {
    email: string | undefined
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
      throw new Error('coreKitInstance is not set or the user is not logged in')
    }

    // In web3auth an account is reset by overwriting the metadata with KEY_NOT_FOUND
    await mpcCoreKit.tKey.storageLayer.setMetadata({
      privKey: new BN(mpcCoreKit.metadataKey, 'hex'),
      input: { message: 'KEY_NOT_FOUND' },
    })
  }

  const triggerLogin = async () => {
    if (!onboard) {
      console.error('Onboard not initialized')
      return
    }

    if (!mpcCoreKit) {
      console.error('tKey not initialized yet')
      return
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

      if (mpcCoreKit.status === COREKIT_STATUS.LOGGED_IN) {
        connectWallet(onboard, {
          autoSelect: {
            label: ONBOARD_MPC_MODULE_LABEL,
            disableModals: true,
          },
        }).catch((reason) => console.error('Error connecting to MPC module:', reason))
      }

      setWalletState(MPCWalletState.AUTHENTICATED)
    } catch (error) {
      setWalletState(MPCWalletState.NOT_INITIALIZED)
      console.error(error)
    }
  }

  return {
    triggerLogin,
    walletState,
    recoverFactorWithPassword: () => Promise.resolve(),
    resetAccount: criticalResetAccount,
    upsertPasswordBackup: () => Promise.resolve(),
    userInfo: {
      email: mpcCoreKit?.state.userInfo?.email,
    },
  }
}
