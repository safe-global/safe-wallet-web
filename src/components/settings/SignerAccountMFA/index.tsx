import { Box, Typography } from '@mui/material'

import { PasswordForm } from './PasswordForm'
import useWallet from '@/hooks/wallets/useWallet'
import { ONBOARD_MPC_MODULE_LABEL } from '@/services/mpc/module'

const SignerAccountMFA = () => {
  const wallet = useWallet()

  if (wallet?.label !== ONBOARD_MPC_MODULE_LABEL) {
    return (
      <Box>
        <Typography>You are currently not logged in with a social account</Typography>
      </Box>
    )
  }

  return <PasswordForm />
}

export default SignerAccountMFA
