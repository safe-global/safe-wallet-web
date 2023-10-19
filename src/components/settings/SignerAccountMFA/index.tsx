import { Box, Typography } from '@mui/material'

import { PasswordForm } from './PasswordForm'
import useWallet from '@/hooks/wallets/useWallet'
import { isSocialLoginWallet } from '@/services/mpc/module'

const SignerAccountMFA = () => {
  const wallet = useWallet()

  const isSocialLogin = isSocialLoginWallet(wallet?.label)

  if (!isSocialLogin) {
    return (
      <Box>
        <Typography>You are currently not logged in with a social account</Typography>
      </Box>
    )
  }

  return <PasswordForm />
}

export default SignerAccountMFA
