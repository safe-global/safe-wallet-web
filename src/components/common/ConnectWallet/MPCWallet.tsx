import { Box, Button, CircularProgress, DialogContent, IconButton, TextField, Typography } from '@mui/material'
import { useContext, useMemo, useState } from 'react'
import useMPC from '@/hooks/wallets/mpc/useMPC'
import { EthHashInfo } from '@safe-global/safe-react-components'
import ModalDialog from '../ModalDialog'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { MpcWalletContext } from './MPCWalletProvider'
import useWallet from '@/hooks/wallets/useWallet'
import { MPCWalletState } from '@/hooks/wallets/mpc/useMPCWallet'

export const MPCWallet = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [recoveryPassword, setRecoveryPassword] = useState<string>('')
  const [showSetPassword, setShowSetPassword] = useState(false)
  const tKey = useMPC()
  const {
    loginPending,
    walletAddress,
    walletState,
    triggerLogin,
    resetAccount,
    user,
    upsertPasswordBackup,
    recoverFactorWithPassword,
  } = useContext(MpcWalletContext)

  const wallet = useWallet()

  const openSetPasswordModal = async () => {
    setRecoveryPassword('')
    setShowSetPassword(true)
  }

  const updatePassword = async () => {
    await upsertPasswordBackup(recoveryPassword)
    setShowSetPassword(false)
    setRecoveryPassword('')
  }

  const hasManualBackup = useMemo(() => {
    if (!tKey) {
      return false
    }

    try {
      console.log('Updating manual backup')

      const shares = Object.values(tKey.getMetadata().getShareDescription())
      console.log('Tkey data', tKey)
      //return shares.some((share) => share.some((description) => description.includes('manual share')))
      return false
    } catch (err) {
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
                <Button variant="contained" size="small" onClick={openSetPasswordModal}>
                  Backup
                </Button>
              )}
            </span>
          </Box>
        </>
      ) : (
        <Button variant="contained" onClick={triggerLogin} disabled={loginPending}>
          {loginPending ? (
            <>
              Login Pending <CircularProgress size={20} />{' '}
            </>
          ) : (
            'Login with Socials'
          )}
        </Button>
      )}
      {walletState === MPCWalletState.RECOVERING_ACCOUNT_PASSWORD && (
        <ModalDialog open dialogTitle="Enter your recovery password" hideChainIndicator>
          <DialogContent>
            <Box>
              <Typography>
                This browser is not registered with your Account yet. Please enter your recovery password to restore
                access to this account.
              </Typography>
              <Box mt={2} display="flex" flexDirection="row" gap={1}>
                <TextField
                  label="Recovery password"
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  value={recoveryPassword}
                  onChange={(event) => {
                    setRecoveryPassword(event.target.value)
                  }}
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword((prev) => !prev)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    ),
                  }}
                />
                <Button variant="contained" onClick={() => recoverFactorWithPassword(recoveryPassword)}>
                  Submit
                </Button>
              </Box>
            </Box>
          </DialogContent>
        </ModalDialog>
      )}

      {showSetPassword && (
        <ModalDialog open dialogTitle="Set a new recovery password" hideChainIndicator>
          <DialogContent>
            <Box>
              <Typography>
                Pick a password to recover your device share. You will need to enter this password if you login on a new
                device or browser
              </Typography>
              <Box mt={2} display="flex" flexDirection="row" gap={1}>
                <TextField
                  label="Recovery password"
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  value={recoveryPassword}
                  onChange={(event) => {
                    setRecoveryPassword(event.target.value)
                  }}
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword((prev) => !prev)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    ),
                  }}
                />
                <Button variant="contained" onClick={() => updatePassword()}>
                  Submit
                </Button>
              </Box>
            </Box>
          </DialogContent>
        </ModalDialog>
      )}
    </>
  )
}
