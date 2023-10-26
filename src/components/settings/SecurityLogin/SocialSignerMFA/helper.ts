import { SecurityQuestionRecovery } from '@/hooks/wallets/mpc/recovery/SecurityQuestionRecovery'
import { trackEvent } from '@/services/analytics'
import { MPC_WALLET_EVENTS } from '@/services/analytics/events/mpcWallet'
import { logError } from '@/services/exceptions'
import ErrorCodes from '@/services/exceptions/ErrorCodes'
import { asError } from '@/services/exceptions/utils'
import { type Web3AuthMPCCoreKit } from '@web3auth/mpc-core-kit'

export const isMFAEnabled = (mpcCoreKit: Web3AuthMPCCoreKit) => {
  if (!mpcCoreKit) {
    return false
  }
  const { shareDescriptions } = mpcCoreKit.getKeyDetails()
  return !Object.values(shareDescriptions).some((value) => value[0]?.includes('hashedShare'))
}

export const enableMFA = async (
  mpcCoreKit: Web3AuthMPCCoreKit,
  {
    newPassword,
    currentPassword,
  }: {
    newPassword: string
    currentPassword: string | undefined
  },
) => {
  if (!mpcCoreKit) {
    return
  }
  const securityQuestions = new SecurityQuestionRecovery(mpcCoreKit)
  try {
    // 1. setup device factor with password recovery
    await securityQuestions.upsertPassword(newPassword, currentPassword)
    const securityQuestionFactor = await securityQuestions.recoverWithPassword(newPassword)
    if (!securityQuestionFactor) {
      throw Error('Could not recover using the new password recovery')
    }

    if (!isMFAEnabled(mpcCoreKit)) {
      trackEvent(MPC_WALLET_EVENTS.ENABLE_MFA)
      // 2. enable MFA in mpcCoreKit
      await mpcCoreKit.enableMFA({}, false)
    }

    await mpcCoreKit.commitChanges()
  } catch (e) {
    const error = asError(e)
    logError(ErrorCodes._304, error.message)
    throw error
  }
}
