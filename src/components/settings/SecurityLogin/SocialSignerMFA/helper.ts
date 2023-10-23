import { SecurityQuestionRecovery } from '@/hooks/wallets/mpc/recovery/SecurityQuestionRecovery'
import { trackEvent } from '@/services/analytics'
import { MPC_WALLET_EVENTS } from '@/services/analytics/events/mpcWallet'
import { logError } from '@/services/exceptions'
import ErrorCodes from '@/services/exceptions/ErrorCodes'
import { asError } from '@/services/exceptions/utils'
import { type Web3AuthMPCCoreKit } from '@web3auth/mpc-core-kit'
import { showNotification } from '@/store/notificationsSlice'
import { type AppDispatch } from '@/store'

export const isMFAEnabled = (mpcCoreKit: Web3AuthMPCCoreKit) => {
  if (!mpcCoreKit) {
    return false
  }
  const { shareDescriptions } = mpcCoreKit.getKeyDetails()
  return !Object.values(shareDescriptions).some((value) => value[0]?.includes('hashedShare'))
}

export const enableMFA = async (
  dispatch: AppDispatch,
  mpcCoreKit: Web3AuthMPCCoreKit,
  {
    newPassword,
    oldPassword,
  }: {
    newPassword: string
    oldPassword: string | undefined
  },
) => {
  if (!mpcCoreKit) {
    return
  }
  const securityQuestions = new SecurityQuestionRecovery(mpcCoreKit)
  try {
    // 1. setup device factor with password recovery
    await securityQuestions.upsertPassword(newPassword, oldPassword)
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

    dispatch(
      showNotification({
        variant: 'success',
        groupKey: 'global-upsert-password',
        message: 'Successfully created or updated password',
      }),
    )
  } catch (e) {
    const error = asError(e)
    logError(ErrorCodes._304, error.message)

    // TODO: Check if we should use a notification or show an error inside the form
    dispatch(
      showNotification({
        variant: 'error',
        groupKey: 'global-upsert-password',
        message: 'Failed to create or update password',
      }),
    )
  }
}
