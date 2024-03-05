import useRecovery from '@/features/recovery/hooks/useRecovery'
import {
  changeEmail,
  deleteRegisteredEmail,
  getRegisteredEmail,
  registerEmail,
  registerRecoveryModule,
  resendEmailVerificationCode,
  verifyEmail,
} from '@safe-global/safe-gateway-typescript-sdk'
import useSafeInfo from '@/hooks/useSafeInfo'
import useOnboard from '@/hooks/wallets/useOnboard'
import { getAssertedChainSigner } from '@/services/tx/tx-sender/sdk'

const useRecoveryEmail = () => {
  const onboard = useOnboard()
  const { safe, safeAddress } = useSafeInfo()
  const [recovery] = useRecovery()

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

  const registerRecovery = () => {
    if (!recovery || recovery.length === 0) return

    return registerRecoveryModule(safe.chainId, safeAddress, { moduleAddress: recovery[0].address })
  }

  return {
    getSignerEmailAddress,
    registerEmailAddress,
    verifyEmailAddress,
    deleteEmailAddress,
    editEmailAddress,
    resendVerification,
    registerRecovery,
  }
}

export default useRecoveryEmail
