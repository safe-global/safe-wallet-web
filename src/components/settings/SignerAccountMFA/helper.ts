import { DeviceShareRecovery } from '@/hooks/wallets/mpc/recovery/DeviceShareRecovery'
import { SecurityQuestionRecovery } from '@/hooks/wallets/mpc/recovery/SecurityQuestionRecovery'
import { logError } from '@/services/exceptions'
import ErrorCodes from '@/services/exceptions/ErrorCodes'
import { asError } from '@/services/exceptions/utils'
import { getPubKeyPoint } from '@tkey-mpc/common-types'
import { type Web3AuthMPCCoreKit } from '@web3auth/mpc-core-kit'
import BN from 'bn.js'

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
    oldPassword,
    storeDeviceShare,
  }: {
    newPassword: string
    oldPassword: string | undefined
    storeDeviceShare: boolean
  },
) => {
  if (!mpcCoreKit) {
    return
  }
  const securityQuestions = new SecurityQuestionRecovery(mpcCoreKit)
  const deviceShareRecovery = new DeviceShareRecovery(mpcCoreKit)
  try {
    // 1. setup device factor with password recovery
    await securityQuestions.upsertPassword(newPassword, oldPassword)
    const securityQuestionFactor = await securityQuestions.recoverWithPassword(newPassword)
    if (!securityQuestionFactor) {
      throw Error('Could not recover using the new password recovery')
    }
    // We commit the new password separately
    // It is necessary to be able to input the password factor before removing the (active) device factor
    await mpcCoreKit.commitChanges()

    if (!isMFAEnabled(mpcCoreKit)) {
      // 2. enable MFA in mpcCoreKit
      const recoveryFactor = await mpcCoreKit.enableMFA({})

      // 3. remove the recovery factor the mpcCoreKit creates
      const recoverKey = new BN(recoveryFactor, 'hex')
      const recoverPubKey = getPubKeyPoint(recoverKey)
      await mpcCoreKit.deleteFactor(recoverPubKey, recoverKey)
    }

    const hasDeviceShare = await deviceShareRecovery.isEnabled()

    if (!hasDeviceShare && storeDeviceShare) {
      await deviceShareRecovery.createAndStoreDeviceFactor()
    }

    if (hasDeviceShare && !storeDeviceShare) {
      // Switch to password recovery factor such that we can delete the device factor
      await mpcCoreKit.inputFactorKey(new BN(securityQuestionFactor, 'hex'))
      await deviceShareRecovery.removeDeviceFactor()
    }

    await mpcCoreKit.commitChanges()
  } catch (e) {
    const error = asError(e)
    logError(ErrorCodes._304, error.message)
  }
}
