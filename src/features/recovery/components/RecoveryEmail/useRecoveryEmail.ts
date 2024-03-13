import {
  changeEmail,
  deleteRegisteredEmail,
  getRegisteredEmail,
  registerEmail,
  resendEmailVerificationCode,
  unsubscribeSingle,
  verifyEmail,
} from '@safe-global/safe-gateway-typescript-sdk'
import useSafeInfo from '@/hooks/useSafeInfo'
import useOnboard from '@/hooks/wallets/useOnboard'
import { getAssertedChainSigner } from '@/services/tx/tx-sender/sdk'

const useRecoveryEmail = () => {
  const onboard = useOnboard()
  const { safe, safeAddress } = useSafeInfo()

  const registerEmailAddress = async (emailAddress: string) => {
    if (!onboard) return

    const signer = await getAssertedChainSigner(onboard, safe.chainId)
    const timestamp = Date.now().toString()
    const messageToSign = `email-register-${safe.chainId}-${safeAddress}-${emailAddress}-${signer.address}-${timestamp}`
    const signedMessage = await signer.signMessage(messageToSign)

    return registerEmail(
      safe.chainId,
      safeAddress,
      {
        emailAddress,
        signer: signer.address,
      },
      {
        'Safe-Wallet-Signature': signedMessage,
        'Safe-Wallet-Signature-Timestamp': timestamp,
      },
    )
  }

  const getSignerEmailAddress = async () => {
    if (!onboard) return

    const signer = await getAssertedChainSigner(onboard, safe.chainId)
    const timestamp = Date.now().toString()
    const messageToSign = `email-retrieval-${safe.chainId}-${safeAddress}-${signer.address}-${timestamp}`
    const signedMessage = await signer.signMessage(messageToSign)

    return getRegisteredEmail(safe.chainId, safeAddress, signer.address, {
      'Safe-Wallet-Signature': signedMessage,
      'Safe-Wallet-Signature-Timestamp': timestamp,
    })
  }

  const verifyEmailAddress = async (verificationCode: string) => {
    if (!onboard) return

    const signer = await getAssertedChainSigner(onboard, safe.chainId)

    return verifyEmail(safe.chainId, safeAddress, signer.address, { code: verificationCode })
  }

  const resendVerification = async () => {
    if (!onboard) return

    const signer = await getAssertedChainSigner(onboard, safe.chainId)

    return resendEmailVerificationCode(safe.chainId, safeAddress, signer.address)
  }

  const deleteEmailAddress = async () => {
    if (!onboard) return

    const signer = await getAssertedChainSigner(onboard, safe.chainId)
    const timestamp = Date.now().toString()
    const messageToSign = `email-delete-${safe.chainId}-${safeAddress}-${signer.address}-${timestamp}`
    const signedMessage = await signer.signMessage(messageToSign)

    return deleteRegisteredEmail(safe.chainId, safeAddress, signer.address, {
      'Safe-Wallet-Signature': signedMessage,
      'Safe-Wallet-Signature-Timestamp': timestamp,
    })
  }

  const editEmailAddress = async (emailAddress: string) => {
    if (!onboard) return

    const signer = await getAssertedChainSigner(onboard, safe.chainId)
    const timestamp = Date.now().toString()
    const messageToSign = `email-edit-${safe.chainId}-${safeAddress}-${emailAddress}-${signer.address}-${timestamp}`
    const signedMessage = await signer.signMessage(messageToSign)

    return changeEmail(
      safe.chainId,
      safeAddress,
      signer.address,
      { emailAddress },
      {
        'Safe-Wallet-Signature': signedMessage,
        'Safe-Wallet-Signature-Timestamp': timestamp,
      },
    )
  }

  const unsubscribeFromSingleCategory = (token: string, category: string) => {
    return unsubscribeSingle({ token, category })
  }

  return {
    getSignerEmailAddress,
    registerEmailAddress,
    verifyEmailAddress,
    deleteEmailAddress,
    editEmailAddress,
    resendVerification,
    unsubscribeFromSingleCategory,
  }
}

export default useRecoveryEmail
