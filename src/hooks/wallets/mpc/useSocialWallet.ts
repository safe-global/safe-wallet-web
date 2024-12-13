import ExternalStore from '@/services/ExternalStore'
import type { ISocialWalletService } from '@/services/mpc/interfaces'
import { type Web3AuthMPCCoreKit } from '@web3auth/mpc-core-kit'

const { getStore, setStore, useStore } = new ExternalStore<ISocialWalletService>()

export const initSocialWallet = async (mpcCoreKit: Web3AuthMPCCoreKit) => {
  const SocialWalletService = (await import('@/services/mpc/SocialWalletService')).default
  const socialWalletService = new SocialWalletService(mpcCoreKit)
  setStore(socialWalletService)

  return socialWalletService
}

export const getSocialWalletService = getStore

export const __setSocialWalletService = setStore

export default useStore
