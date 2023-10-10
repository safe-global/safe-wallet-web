import CopyButton from '@/components/common/CopyButton'
import useMPC from '@/hooks/wallets/mpc/useMPC'
import { Alert, Box, Button, TextField, Typography } from '@mui/material'
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

  const hidePK = () => {
    setPk(undefined)
  }

  if (!isLoggedIn) {
    return null
  }
  return (
    <Box>
      <Box>
        <Typography>
          This action reveals the seedphrase / private key of your logged in signer account. This export can be used to
          move the account into a self-custodial wallet application.
        </Typography>
        <Alert severity="warning" sx={{ mt: 3 }}>
          Anyone who has access to this seedphrase / key has <b>full access</b> over your Signer Account. You should
          never disclose or share it with anyone and store it securely.
        </Alert>
        {pk ? (
          <Box display="flex" flexDirection="row" alignItems="center" mt={3} gap={1}>
            <TextField
              label="Signer account key"
              value={pk}
              type="password"
              InputProps={{ readOnly: true, endAdornment: <CopyButton text={pk} /> }}
            ></TextField>
            <Button color="primary" variant="contained" onClick={hidePK}>
              Hide
            </Button>
          </Box>
        ) : (
          <Button color="primary" variant="contained" onClick={exportPK} sx={{ mt: 3 }}>
            Export
          </Button>
        )}
      </Box>
    </Box>
  )
}

export default ExportMPCAccount
