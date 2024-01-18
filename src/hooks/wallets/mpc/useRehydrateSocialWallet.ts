import useAddressBook from '@/hooks/useAddressBook'
import useChainId from '@/hooks/useChainId'
import { useCurrentChain, useHasFeature } from '@/hooks/useChains'
import useOnboard, { connectWallet } from '@/hooks/wallets/useOnboard'
import { ONBOARD_MPC_MODULE_LABEL } from '@/services/mpc/SocialLoginModule'
import { useAppDispatch } from '@/store'
import { upsertAddressBookEntry } from '@/store/addressBookSlice'
import { type WalletState } from '@web3-onboard/core'
import { type UserInfo } from '@web3auth/mpc-core-kit'
import { useCallback, useEffect } from 'react'
import { checksumAddress } from '@/utils/addresses'
import { FEATURES } from '@/utils/chains'
import { isSocialWalletEnabled } from '../wallets'

const useRehydrateSocialWallet = () => {
  const chain = useCurrentChain()
  const onboard = useOnboard()
  const currentChainId = useChainId()
  const addressBook = useAddressBook()
  const dispatch = useAppDispatch()
  const isSocialLoginEnabled = useHasFeature(FEATURES.SOCIAL_LOGIN)

  const updateAddressBook = useCallback(
    (userInfo: UserInfo | undefined, wallets: WalletState[] | undefined | void) => {
      if (!userInfo || !wallets || !currentChainId || wallets.length === 0) return

      const address = wallets[0].accounts[0]?.address
      if (address) {
        const signerAddress = checksumAddress(address)
        if (addressBook[signerAddress] === undefined) {
          const email = userInfo.email
          dispatch(upsertAddressBookEntry({ address: signerAddress, chainId: currentChainId, name: email }))
        }
      }
    },
    [addressBook, currentChainId, dispatch],
  )

  useEffect(() => {
    if (!chain || !onboard) return

    const rehydrate = async () => {
      const { initMPC } = await import('./useMPC')
      const { initSocialWallet } = await import('./useSocialWallet')
      const mpcCoreKit = await initMPC(chain, onboard)

      if (!mpcCoreKit) return

      const socialWalletService = await initSocialWallet(mpcCoreKit)

      const onConnect = async () => {
        const wallets = await connectWallet(onboard, {
          autoSelect: {
            label: ONBOARD_MPC_MODULE_LABEL,
            disableModals: true,
          },
        }).catch((reason) => console.error('Error connecting to MPC module:', reason))

        // If the signer is not in the address book => add the user's email as name
        const userInfo = socialWalletService?.getUserInfo()
        updateAddressBook(userInfo, wallets)
      }

      socialWalletService.setOnConnect(onConnect)
    }
    const isOnboardModuleEnabled = isSocialWalletEnabled(chain)
    if (isSocialLoginEnabled && isOnboardModuleEnabled) {
      void rehydrate()
    }
  }, [chain, onboard, updateAddressBook, isSocialLoginEnabled])
}

export default useRehydrateSocialWallet
