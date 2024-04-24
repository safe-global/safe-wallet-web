import { useAppDispatch, useAppSelector } from '@/store'
import { selectBlindSigning, setBlindSigning } from '@/store/settingsSlice'
import { Paper, Grid, Typography, FormGroup, FormControlLabel, Checkbox } from '@mui/material'

const SecuritySettings = () => {
  const isBlindSigningEnabled = useAppSelector(selectBlindSigning)
  const dispatch = useAppDispatch()

  return (
    <Paper sx={{ padding: 4 }}>
      <Grid container spacing={3}>
        <Grid item lg={4} xs={12}>
          <Typography variant="h4" fontWeight="bold" mb={1}>
            Security
          </Typography>
        </Grid>

        <Grid item xs>
          <Typography mb={2}>
            Enabling this setting allows signing of unreadable signature requests. Signing such messages can have
            unpredictable implications including loss of funds or control of your account.
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isBlindSigningEnabled}
                  onChange={() => dispatch(setBlindSigning(!isBlindSigningEnabled))}
                />
              }
              label="Enable blind signing"
            />
          </FormGroup>
        </Grid>
      </Grid>
    </Paper>
  )
}

export default SecuritySettings
