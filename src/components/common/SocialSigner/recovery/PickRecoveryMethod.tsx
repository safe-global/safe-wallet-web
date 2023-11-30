import { IS_PRODUCTION } from '@/config/constants'
import {
  Avatar,
  Typography,
  Divider,
  Button,
  Box,
  SvgIcon,
  Grid,
  type ButtonBaseProps,
  ButtonBase,
} from '@mui/material'
import { RecoveryMethod } from './SocialRecoveryModal'
import SmsIcon from '@/public/images/social-signer/mfa_sms.svg'
import PasswordIcon from '@/public/images/social-signer/mfa_password.svg'
import AuthenticatorIcon from '@/public/images/social-signer/mfa_authenticator.svg'

import css from './styles.module.css'
import { MPC_WALLET_EVENTS } from '@/services/analytics/events/mpcWallet'
import Track from '../../Track'

const ImageButton = ({ icon, children, ...props }: ButtonBaseProps & { icon: any }) => {
  return (
    <ButtonBase {...props} className={css.imageButton}>
      <Box display="flex" flexDirection="column" gap={3} alignItems="center" width="100%">
        <SvgIcon inheritViewBox component={icon} sx={{ width: '160px', height: '160px' }}></SvgIcon>
        <Divider sx={{ width: '100%' }} />
        <Typography fontWeight={700} variant="subtitle1">
          {children}
        </Typography>
      </Box>
    </ButtonBase>
  )
}

export const PickRecoveryMethod = ({
  smsEnabled,
  passwordEnabled,
  setRecoveryMethod,
  deleteAccount,
}: {
  smsEnabled: boolean
  passwordEnabled: boolean
  setRecoveryMethod: (method: RecoveryMethod) => void
  deleteAccount?: () => void
}) => {
  return (
    <Box>
      <Box p={4}>
        <Box display="flex" flexDirection="row" gap={1} alignItems="center" mb={0.5}>
          <Avatar className={css.dot}>
            <Typography variant="body2">{1}</Typography>
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Choose your recovery method
            </Typography>
          </Box>
        </Box>
        <Typography variant="body2" pl={'28px'}>
          How would you like to recover your social login signer?
        </Typography>
      </Box>
      <Divider />
      <Grid container direction="row" spacing={2} padding={4}>
        <Grid item lg={4} xs={12}>
          <Track {...MPC_WALLET_EVENTS.CHOOSE_RECOVERY_METHOD} label="sms">
            <ImageButton icon={SmsIcon} onClick={() => setRecoveryMethod(RecoveryMethod.SMS)} disabled={!smsEnabled}>
              SMS
            </ImageButton>
          </Track>
        </Grid>
        <Grid item lg={4} xs={12}>
          <Track {...MPC_WALLET_EVENTS.CHOOSE_RECOVERY_METHOD} label="authenticator">
            <ImageButton icon={AuthenticatorIcon} onClick={() => setRecoveryMethod(RecoveryMethod.PASSWORD)} disabled>
              Authenticator App
            </ImageButton>
          </Track>
        </Grid>
        <Grid item lg={4} xs={12}>
          <Track {...MPC_WALLET_EVENTS.CHOOSE_RECOVERY_METHOD} label="password">
            <ImageButton
              icon={PasswordIcon}
              onClick={() => setRecoveryMethod(RecoveryMethod.PASSWORD)}
              disabled={!passwordEnabled}
            >
              Password
            </ImageButton>
          </Track>
        </Grid>

        {!IS_PRODUCTION && (
          <Grid item xs={12}>
            <Button onClick={deleteAccount} variant="danger" sx={{ height: '64px' }}>
              Delete account
            </Button>
          </Grid>
        )}
      </Grid>
    </Box>
  )
}
