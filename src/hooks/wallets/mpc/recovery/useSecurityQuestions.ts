import { TssSecurityQuestion, TssShareType, type Web3AuthMPCCoreKit } from '@web3auth/mpc-core-kit'

const DEFAULT_SECURITY_QUESTION = 'ENTER PASSWORD'

const securityQuestions = new TssSecurityQuestion()

export const useSecurityQuestions = (mpcCoreKit: Web3AuthMPCCoreKit | undefined) => {
  const isEnabled = () => {
    if (!mpcCoreKit) {
      return false
    }
    try {
      const question = securityQuestions.getQuestion(mpcCoreKit)
      return !!question
    } catch (error) {
      console.error(error)
      // It errors out if recovery is not setup currently
      return false
    }
  }

  const upsertPassword = async (newPassword: string, oldPassword?: string) => {
    if (!mpcCoreKit) {
      return
    }
    if (isEnabled()) {
      if (!oldPassword) {
        throw Error('To change the password you need to provide the old password')
      }
      await securityQuestions.changeSecurityQuestion({
        answer: oldPassword,
        mpcCoreKit,
        newAnswer: newPassword,
        newQuestion: DEFAULT_SECURITY_QUESTION,
      })
    } else {
      await securityQuestions.setSecurityQuestion({
        question: DEFAULT_SECURITY_QUESTION,
        answer: newPassword,
        mpcCoreKit,
        shareType: TssShareType.DEVICE,
      })
    }
  }

  const recoverWithPassword = async (password: string) => {
    if (!mpcCoreKit) {
      return
    }
    return securityQuestions.recoverFactor(mpcCoreKit, password)
  }

  return {
    isEnabled,
    upsertPassword,
    recoverWithPassword,
  }
}
