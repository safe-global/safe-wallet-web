import useAddressBook from '@/hooks/useAddressBook'
import useChainId from '@/hooks/useChainId'
import { useCurrentChain } from '@/hooks/useChains'
import useOnboard, { connectWallet } from '@/hooks/wallets/useOnboard'
import { ONBOARD_MPC_MODULE_LABEL } from '@/services/mpc/SocialLoginModule'
import { useAppDispatch } from '@/store'
import { upsertAddressBookEntry } from '@/store/addressBookSlice'
import { useEffect } from 'react'
import { checksumAddress } from '@/utils/addresses'

const useRehydrateSocialWallet = () => {
  const chain = useCurrentChain()
  const onboard = useOnboard()
  const currentChainId = useChainId()
  const addressBook = useAddressBook()
  const dispatch = useAppDispatch()

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
      }

      socialWalletService.setOnConnect(onConnect)
    }

    void rehydrate()
  }, [addressBook, chain, currentChainId, dispatch, onboard])
}

export default useRehydrateSocialWallet
