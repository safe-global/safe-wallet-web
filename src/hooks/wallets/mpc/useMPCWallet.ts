import { useState } from 'react'
import useMPC from './useMPC'
import BN from 'bn.js'
import { GOOGLE_CLIENT_ID, WEB3AUTH_VERIFIER_ID } from '@/config/constants'
import { COREKIT_STATUS, getWebBrowserFactor, type UserInfo } from '@web3auth/mpc-core-kit'
import useOnboard, { connectWallet } from '../useOnboard'
import { ONBOARD_MPC_MODULE_LABEL } from '@/services/mpc/module'
import { SecurityQuestionRecovery } from './recovery/SecurityQuestionRecovery'
import { DeviceShareRecovery } from './recovery/DeviceShareRecovery'
import { trackEvent } from '@/services/analytics'
import { MPC_WALLET_EVENTS } from '@/services/analytics/events/mpcWallet'
import useAddressBook from '@/hooks/useAddressBook'
import { useCurrentChain } from '@/hooks/useChains'
import { upsertAddressBookEntry } from '@/store/addressBookSlice'
import { useAppDispatch } from '@/store'
import { ethers } from 'ethers'

export enum MPCWalletState {
  NOT_INITIALIZED,
  AUTHENTICATING,
  MANUAL_RECOVERY,
  READY,
}

export type MPCWalletHook = {
  upsertPasswordBackup: (password: string) => Promise<void>
  recoverFactorWithPassword: (password: string, storeDeviceShare: boolean) => Promise<boolean>
  walletState: MPCWalletState
  triggerLogin: () => Promise<boolean>
  resetAccount: () => Promise<void>
  userInfo: UserInfo | undefined
}

export const useMPCWallet = (): MPCWalletHook => {
  const [walletState, setWalletState] = useState(MPCWalletState.NOT_INITIALIZED)
  const mpcCoreKit = useMPC()
  const onboard = useOnboard()
  const addressBook = useAddressBook()
  const currentChainId = useCurrentChain()
  const dispatch = useAppDispatch()

  const criticalResetAccount = async (): Promise<void> => {
    // This is a critical function that should only be used for testing purposes
    // Resetting your account means clearing all the metadata associated with it from the metadata server
    // The key details will be deleted from our server and you will not be able to recover your account
    if (!mpcCoreKit?.metadataKey) {
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
            trackEvent(MPC_WALLET_EVENTS.MANUAL_RECOVERY)
            setWalletState(MPCWalletState.MANUAL_RECOVERY)
            return false
          }
        }
      }

      await finalizeLogin()
      return mpcCoreKit.status === COREKIT_STATUS.LOGGED_IN
    } catch (error) {
      setWalletState(MPCWalletState.NOT_INITIALIZED)
      console.error(error)
      return false
    }
  }

  const finalizeLogin = async () => {
    if (!mpcCoreKit || !onboard) {
      return
    }

    if (mpcCoreKit.status === COREKIT_STATUS.LOGGED_IN) {
      await mpcCoreKit.commitChanges()

      const wallets = await connectWallet(onboard, {
        autoSelect: {
          label: ONBOARD_MPC_MODULE_LABEL,
          disableModals: true,
        },
      }).catch((reason) => console.error('Error connecting to MPC module:', reason))

      // If the signer is not in the address book => add it as the user's first name
      if (wallets && currentChainId && wallets.length > 0) {
        const signerAddress = ethers.utils.getAddress(wallets[0].accounts[0]?.address)
        if (addressBook[signerAddress] === undefined) {
          const email = mpcCoreKit.getUserInfo().email
          dispatch(upsertAddressBookEntry({ address: signerAddress, chainId: currentChainId.chainId, name: email }))
        }
      }
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

      await finalizeLogin()
    }

    return mpcCoreKit.status === COREKIT_STATUS.LOGGED_IN
  }

  return {
    triggerLogin,
    walletState,
    recoverFactorWithPassword,
    resetAccount: criticalResetAccount,
    upsertPasswordBackup: () => Promise.resolve(),
    userInfo: mpcCoreKit?.state.userInfo,
  }
}
