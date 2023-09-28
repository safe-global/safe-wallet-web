import CopyButton from '@/components/common/CopyButton'
import useMPC from '@/hooks/wallets/mpc/useMPC'
import { Alert, AlertTitle, Box, Button, TextField } from '@mui/material'
import { COREKIT_STATUS } from '@web3auth/mpc-core-kit'
import { useState } from 'react'

const ExportMPCAccount = () => {
  const mpcCoreKit = useMPC()

  const [pk, setPk] = useState<string | undefined>()

  const isLoggedIn = mpcCoreKit?.status === COREKIT_STATUS.LOGGED_IN

  const exportPK = async () => {
    const exportedPK = await mpcCoreKit?._UNSAFE_exportTssKey()
    setPk(exportedPK)
  }
  if (!isLoggedIn) {
    return null
  }
  return (
    <Box>
      <Box>
        <Alert severity="warning" sx={{ mt: 3 }}>
          <AlertTitle sx={{ fontWeight: 700 }}>Account key export</AlertTitle>
          Anyone who gains access to this key has <b>full access</b> over your Signer Account.
        </Alert>
        {pk ? (
          <Box display="flex" flexDirection="row" alignItems="center" mt={3}>
            <TextField
              label="Signer account key"
              value={pk}
              type="password"
              InputProps={{ readOnly: true, endAdornment: <CopyButton text={pk} /> }}
            ></TextField>
          </Box>
        ) : (
          <Button color="warning" variant="outlined" onClick={exportPK} sx={{ mt: 3 }}>
            Export
          </Button>
        )}
      </Box>
    </Box>
  )
}

export default ExportMPCAccount
