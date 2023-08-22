import { Box, Button, CircularProgress, DialogContent, IconButton, TextField, Typography } from '@mui/material'
import { useContext, useMemo, useState } from 'react'
import useMPC from '@/hooks/wallets/mpc/useMPC'
import { EthHashInfo } from '@safe-global/safe-react-components'
import ModalDialog from '../ModalDialog'
import CopyButton from '../CopyButton'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { MpcWalletContext } from './MPCWalletProvider'

export const MPCWallet = () => {
  const [showBackup, setShowBackup] = useState(false)
  const tKey = useMPC()
  const {
    copyTSSShareIntoManualBackupFactorkey,
    manualBackup,
    setManualBackup,
    loginPending,
    walletAddress,
    triggerLogin,
    resetAccount,
    user,
  } = useContext(MpcWalletContext)
  const hasManualBackup = useMemo(() => {
    if (!tKey) {
      return false
    }
    try {
      console.log('Updating manual backup')

      const shares = Object.values(tKey.getMetadata().getShareDescription())
      console.log(shares)
      return shares.some((share) => share.some((description) => description.includes('manual share')))
    } catch (err) {
      console.error(err)
      return false
    }
  }, [tKey?.metadata, tKey])

  return (
    <>
      {user ? (
        <>
          <Typography variant="h4" fontWeight={700}>
            Social account
          </Typography>
          {walletAddress ? (
            <EthHashInfo
              name={user.email}
              address={walletAddress}
              shortAddress
              showAvatar
              showPrefix={false}
              showCopyButton={false}
            />
          ) : (
            'Loading...'
          )}
          <Box display="flex" flexDirection="row" gap={2}>
            <span>
              <Button variant="contained" color="error" size="small" onClick={resetAccount}>
                Reset
              </Button>
            </span>
            <span>
              {!hasManualBackup && (
                <Button variant="contained" size="small" onClick={copyTSSShareIntoManualBackupFactorkey}>
                  Backup
                </Button>
              )}
            </span>
          </Box>
        </>
      ) : (
        <Button variant="contained" size="small" onClick={triggerLogin} fullWidth disabled={loginPending}>
          {loginPending ? (
            <>
              Login Pending <CircularProgress size={20} />{' '}
            </>
          ) : (
            'Login with Socials'
          )}
        </Button>
      )}
      {manualBackup && (
        <ModalDialog
          open
          onClose={() => setManualBackup(undefined)}
          dialogTitle="Save your manual backup"
          hideChainIndicator
        >
          <DialogContent>
            <Box>
              <Typography>
                Your manual backup was successfully created. Copy it to be able to recover your account or register it
                on a new device.
              </Typography>
              <Box mt={2} display="flex" flexDirection="row" gap={1}>
                <TextField
                  label="Backup Phrase"
                  type={showBackup ? 'text' : 'password'}
                  value={manualBackup}
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowBackup((prev) => !prev)}
                        edge="end"
                      >
                        {showBackup ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    ),
                  }}
                />
                <CopyButton text={manualBackup} />
              </Box>
            </Box>
          </DialogContent>
        </ModalDialog>
      )}
    </>
  )
}
