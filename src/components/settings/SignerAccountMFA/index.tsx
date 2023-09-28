import useMPC from '@/hooks/wallets/mpc/useMPC'
import { Box, Button, Typography } from '@mui/material'
import { COREKIT_STATUS } from '@web3auth/mpc-core-kit'
import { getPubKeyPoint } from '@tkey-mpc/common-types'
import useMFASettings from './useMFASettings'
import { BN } from 'bn.js'
import { useState } from 'react'

const SignerAccountMFA = () => {
  const mpcCoreKit = useMPC()
  const mfaSettings = useMFASettings()

  const [enablingMFA, setEnablingMFA] = useState(false)

  const enableMFA = async () => {
    if (!mpcCoreKit) {
      return
    }

    setEnablingMFA(true)
    try {
      // First enable MFA in mpcCoreKit
      const recoveryFactor = await mpcCoreKit.enableMFA({})

      // Then remove the recovery factor the mpcCoreKit creates
      const recoverKey = new BN(recoveryFactor, 'hex')
      const recoverPubKey = getPubKeyPoint(recoverKey)
      await mpcCoreKit.deleteFactor(recoverPubKey, recoverKey)
    } catch (error) {
      console.error(error)
    } finally {
      setEnablingMFA(false)
    }
  }

  if (mpcCoreKit?.status !== COREKIT_STATUS.LOGGED_IN) {
    return (
      <Box>
        <Typography>You are currently not logged in with a social account</Typography>
      </Box>
    )
  }

  return (
    <Box>
      {mfaSettings?.mfaEnabled ? (
        <Typography>MFA is enabled!</Typography>
      ) : (
        <Button disabled={enablingMFA} onClick={enableMFA}>
          Enable MFA
        </Button>
      )}
    </Box>
  )
}

export default SignerAccountMFA
