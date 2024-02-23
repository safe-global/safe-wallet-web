import useOnboard from '@/hooks/wallets/useOnboard'
import { asError } from '@/services/exceptions/utils'
import { getAssertedChainSigner } from '@/services/tx/tx-sender/sdk'
import { isWalletRejection } from '@/utils/wallets'
import { useState } from 'react'
import useChainId from '@/hooks/useChainId'
import useSafeInfo from '@/hooks/useSafeInfo'
import { Box, Button, Typography } from '@mui/material'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import { getRegisteredEmail } from '@safe-global/safe-gateway-typescript-sdk'

const RecoveryEmail = () => {
  const [email, setEmail] = useState<string>()
  const onboard = useOnboard()
  const { safe, safeAddress } = useSafeInfo()
  const chainId = useChainId()

  const signToViewEmail = async () => {
    if (!onboard) return

    try {
      const signer = await getAssertedChainSigner(onboard, safe.chainId)
      const timestamp = Date.now().toString()
      const messageToSign = `email-retrieval-${chainId}-${safeAddress}-${signer.address}-${timestamp}`
      const signedMessage = await signer.signMessage(messageToSign)

      const response = await getRegisteredEmail(chainId, safeAddress, signer.address, {
        'Safe-Wallet-Signature': signedMessage,
        'Safe-Wallet-Signature-Timestamp': timestamp,
      })

      setEmail(response.email)
    } catch (e) {
      const error = asError(e)
      setEmail(isWalletRejection(error) ? undefined : 'No email found')
    }
  }

  return (
    <Box mt={4}>
      <Typography fontWeight="bold" mb={1}>
        Notification email
      </Typography>
      {email ? (
        <Typography>{email}</Typography>
      ) : (
        <Button onClick={signToViewEmail} variant="outlined" size="small" startIcon={<VisibilityOutlinedIcon />}>
          Sign to view
        </Button>
      )}
      <Typography mt={1}>
        We will contact you via your notification email address about any initiated recovery attempts and their status.
      </Typography>
    </Box>
  )
}

export default RecoveryEmail
