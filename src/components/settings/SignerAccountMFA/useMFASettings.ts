import useMPC from '@/hooks/wallets/mpc/useMPC'
import { COREKIT_STATUS } from '@web3auth/mpc-core-kit'

export type MFASettings = {
  mfaEnabled: boolean
} | null

const useMFASettings = () => {
  const mpcCoreKit = useMPC()

  if (mpcCoreKit?.status !== COREKIT_STATUS.LOGGED_IN) {
    return null
  }

  const { shareDescriptions } = mpcCoreKit?.getKeyDetails()

  const hashedShareModuleFactor = Object.entries(shareDescriptions).find(([key, value]) =>
    value[0]?.includes('hashedShare'),
  )

  if (hashedShareModuleFactor) {
    return {
      mfaEnabled: false,
    }
  }

  return {
    mfaEnabled: true,
  }
}

export default useMFASettings
