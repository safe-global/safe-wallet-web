import { MPC_WALLET_EVENTS } from '@/services/analytics/events/mpcWallet'
import { VisibilityOff, Visibility } from '@mui/icons-material'
import {
  DialogContent,
  Typography,
  TextField,
  IconButton,
  FormControlLabel,
  Checkbox,
  Button,
  Box,
} from '@mui/material'
import { useState } from 'react'
import ModalDialog from '../ModalDialog'
import Track from '../Track'

export const PasswordRecovery = ({
  recoverFactorWithPassword,
}: {
  recoverFactorWithPassword: (password: string, storeDeviceFactor: boolean) => Promise<void>
}) => {
  const [showPassword, setShowPassword] = useState(false)
  const [recoveryPassword, setRecoveryPassword] = useState<string>('')
  const [storeDeviceFactor, setStoreDeviceFactor] = useState(false)
  return (
    <ModalDialog open dialogTitle="Enter your recovery password" hideChainIndicator>
      <DialogContent>
        <Box>
          <Typography>
            This browser is not registered with your Account yet. Please enter your recovery password to restore access
            to this Account.
          </Typography>
          <Box mt={2} display="flex" flexDirection="column" alignItems="baseline" gap={2}>
            <TextField
              label="Recovery password"
              type={showPassword ? 'text' : 'password'}
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
            <FormControlLabel
              control={<Checkbox checked={storeDeviceFactor} onClick={() => setStoreDeviceFactor((prev) => !prev)} />}
              label="Do not ask again on this device"
            />
            <Track {...MPC_WALLET_EVENTS.RECOVER_PASSWORD}>
              <Button
                variant="contained"
                onClick={() => recoverFactorWithPassword(recoveryPassword, storeDeviceFactor)}
              >
                Submit
              </Button>
            </Track>
          </Box>
        </Box>
      </DialogContent>
    </ModalDialog>
  )
}
