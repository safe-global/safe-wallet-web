import { COREKIT_STATUS, type Web3AuthMPCCoreKit } from '@web3auth/mpc-core-kit'

export type MFASettings = {
  mfaEnabled: boolean
} | null

const useMFASettings = (mpcCoreKit: Web3AuthMPCCoreKit | undefined) => {
  if (mpcCoreKit?.status !== COREKIT_STATUS.LOGGED_IN) {
    return null
  }

  const { shareDescriptions } = mpcCoreKit?.getKeyDetails()

  const isMFAEnabled = !Object.entries(shareDescriptions).some(([key, value]) => value[0]?.includes('hashedShare'))

  return {
    mfaEnabled: isMFAEnabled,
  }
}

export default useMFASettings
