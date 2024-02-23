import { useState } from 'react'
import useChainId from '@/hooks/useChainId'
import useSafeInfo from '@/hooks/useSafeInfo'
import useWallet from '@/hooks/wallets/useWallet'
import { Box, Button, Typography } from '@mui/material'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import { getRegisteredEmail } from '@safe-global/safe-gateway-typescript-sdk'

const RecoveryEmail = () => {
  const [email, setEmail] = useState<string>()
  const wallet = useWallet()
  const { safeAddress } = useSafeInfo()
  const chainId = useChainId()

  const signToViewEmail = async () => {
    if (!wallet) return

    try {
      const timestamp = Date.now().toString()
      const messageToSign = `email-retrieval-${chainId}-${safeAddress}-${wallet.address}-${timestamp}`
      const signedMessage = await wallet.provider.request({
        method: 'personal_sign',
        params: [messageToSign, wallet.address],
      })
      const response = await getRegisteredEmail(chainId, safeAddress, wallet?.address, {
        'Safe-Wallet-Signature': signedMessage,
        'Safe-Wallet-Signature-Timestamp': timestamp,
      })

      setEmail(response.email)
    } catch (e) {
      setEmail('No email found')
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
