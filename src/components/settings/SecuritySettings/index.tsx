import { useAppDispatch, useAppSelector } from '@/store'
import { selectBlindSigning, setBlindSigning } from '@/store/settingsSlice'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'

const SecuritySettings = () => {
  const isBlindSigningEnabled = useAppSelector(selectBlindSigning)
  const dispatch = useAppDispatch()

  return (
    <Paper sx={{ padding: 4 }}>
      <Grid container spacing={3}>
        <Grid item lg={4} xs={12}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 'bold',
              mb: 1,
            }}
          >
            Security
          </Typography>
        </Grid>

        <Grid item xs>
          <Typography
            sx={{
              mb: 2,
            }}
          >
            Enabling this setting allows the signing of unreadable signature requests. Signing these messages can lead
            to unpredictable consequences, including the potential loss of funds or control over your account.
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
