import useAddressBook from '@/hooks/useAddressBook'
import useChainId from '@/hooks/useChainId'
import ExternalStore from '@/services/ExternalStore'
import type { ISocialWalletService } from '@/services/mpc/interfaces'
import { ONBOARD_MPC_MODULE_LABEL } from '@/services/mpc/SocialLoginModule'
import SocialWalletService from '@/services/mpc/SocialWalletService'
import { useAppDispatch } from '@/store'
import { upsertAddressBookEntry } from '@/store/addressBookSlice'
import { checksumAddress } from '@/utils/addresses'
import { useCallback, useEffect } from 'react'
import useOnboard, { connectWallet } from '../useOnboard'
import useMpc from './useMPC'

const { getStore, setStore, useStore } = new ExternalStore<ISocialWalletService>()

// Listen to onboard modal open and hide the social login button
const hideOnboardButton = () => {
  const onboardRoot = document.querySelector('onboard-v2')?.shadowRoot
  if (!onboardRoot) return

  const hideSocialLoginButton = () => {
    const walletButtons = onboardRoot.querySelectorAll('.wallet-button-container') || []
    const socialButton = Array.from(walletButtons).find((el) => el.textContent?.includes(ONBOARD_MPC_MODULE_LABEL))
    socialButton?.remove()
  }

  const observer = new MutationObserver(hideSocialLoginButton)
  observer.observe(onboardRoot, { childList: true })

  return () => observer.disconnect()
}

export const useInitSocialWallet = () => {
  const mpcCoreKit = useMpc()
  const onboard = useOnboard()
  const addressBook = useAddressBook()
  const currentChainId = useChainId()
  const dispatch = useAppDispatch()
  const socialWalletService = useStore()

  const onConnect = useCallback(async () => {
    if (!onboard || !socialWalletService) return

    const wallets = await connectWallet(onboard, {
      autoSelect: {
        label: ONBOARD_MPC_MODULE_LABEL,
        disableModals: true,
      },
    }).catch((reason) => console.error('Error connecting to MPC module:', reason))

    // If the signer is not in the address book => add the user's email as name
    const userInfo = socialWalletService.getUserInfo()
    if (userInfo && wallets && currentChainId && wallets.length > 0) {
      const address = wallets[0].accounts[0]?.address
      if (address) {
        const signerAddress = checksumAddress(address)
        if (addressBook[signerAddress] === undefined) {
          const email = userInfo.email
          dispatch(upsertAddressBookEntry({ address: signerAddress, chainId: currentChainId, name: email }))
        }
      }
    }
  }, [addressBook, currentChainId, dispatch, onboard, socialWalletService])

  useEffect(() => {
    socialWalletService?.setOnConnect(onConnect)
  }, [onConnect, socialWalletService])

  useEffect(() => {
    if (mpcCoreKit) {
      setStore(new SocialWalletService(mpcCoreKit))
    }
  }, [mpcCoreKit])

  // Hide social login when onboard pops up
  // @FIXME the button should work but atm it doesn't
  useEffect(() => {
    if (!onboard) return
    return hideOnboardButton()
  }, [onboard])
}

export const getSocialWalletService = getStore

export const __setSocialWalletService = setStore

export default useStore
