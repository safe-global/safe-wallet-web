import useMPC from '@/hooks/wallets/mpc/useMPC'
import { Box, Typography } from '@mui/material'
import { COREKIT_STATUS } from '@web3auth/mpc-core-kit'

import { PasswordForm } from './PasswordForm'

const SignerAccountMFA = () => {
  const mpcCoreKit = useMPC()

  if (mpcCoreKit?.status !== COREKIT_STATUS.LOGGED_IN) {
    return (
      <Box>
        <Typography>You are currently not logged in with a social account</Typography>
      </Box>
    )
  }

  return <PasswordForm mpcCoreKit={mpcCoreKit} />
}

export default SignerAccountMFA
