import { Grid, Paper, Typography } from '@mui/material'
import PasswordMfaForm from '@/components/settings/SecurityLogin/PasswordMfaForm'
import SocialSignerExport from '@/components/settings/SecurityLogin/SocialSignerExport'
import useWallet from '@/hooks/wallets/useWallet'
import { isSocialLoginWallet } from '@/services/mpc/SocialLoginModule'
import SmsMfaForm from './SmsMfaForm'

const SecurityLogin = () => {
  const wallet = useWallet()

  const isSocialLogin = isSocialLoginWallet(wallet?.label)

  if (!isSocialLogin) {
    return (
      <Paper sx={{ p: 4 }}>
        <Typography>You are currently not logged in with a social login signer.</Typography>
      </Paper>
    )
  }

  return (
    <>
      <Paper sx={{ p: 4 }}>
        <Grid container spacing={3}>
          <Grid item lg={4} xs={12}>
            <Typography variant="h4" fontWeight="bold" mb={1}>
              Multi-factor Authentication
            </Typography>
          </Grid>

          <Grid item xs>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography>
                  Methods used to restore access to your social login signer in another browser or on another device.
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <PasswordMfaForm />
              </Grid>
              <Grid item xs={12}>
                <SmsMfaForm />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
      <Paper sx={{ p: 4, mt: 2 }}>
        <Grid container spacing={3}>
          <Grid item lg={4} xs={12}>
            <Typography variant="h4" fontWeight="bold" mb={1}>
              Social login signer export
            </Typography>
          </Grid>
          <Grid item xs>
            <SocialSignerExport />
          </Grid>
        </Grid>
      </Paper>
    </>
  )
}

export default SecurityLogin
