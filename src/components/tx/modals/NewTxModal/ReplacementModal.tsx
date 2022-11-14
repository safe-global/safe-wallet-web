import {
  Button,
  DialogContent,
  SvgIcon,
  Tooltip,
  Typography,
  Stepper,
  Step,
  StepLabel,
  DialogActions,
  Grid,
} from '@mui/material'

import ModalDialog from '@/components/common/ModalDialog'
import InfoIcon from '@/public/images/notifications/info.svg'
import RocketIcon from '@/public/images/transactions/rocket.svg'
import CheckIcon from '@mui/icons-material/Check'
import DeleteIcon from '@/public/images/common/delete.svg'
import { SendTokensButton, SendNFTsButton } from './TxButton'

import css from './styles.module.css'

const wrapIcon = (icon: React.ReactNode) => <div className={css.circle}>{icon}</div>

const steps = [
  {
    label: 'Create new transaction with same nonce',
    icon: <div className={css.redCircle} />,
  },
  {
    label: 'Collect confirmations from owners',
    icon: wrapIcon(<CheckIcon fontSize="small" color="border" />),
  },
  {
    label: 'Execute replacement transaction',
    icon: wrapIcon(<SvgIcon component={RocketIcon} inheritViewBox fontSize="small" color="border" />),
  },
  {
    label: 'Initial transaction is replaced',
    icon: wrapIcon(<SvgIcon component={DeleteIcon} inheritViewBox fontSize="small" color="border" />),
  },
]

const ReplacementModal = ({
  txNonce,
  onClose,
  onTokenModalOpen,
  onNFTModalOpen,
  onRejectModalOpen,
}: {
  txNonce: number
  onClose: () => void
  onTokenModalOpen: () => void
  onNFTModalOpen: () => void
  onRejectModalOpen: () => void
}) => {
  return (
    <ModalDialog open dialogTitle={`Replace transaction with nonce ${txNonce}`} onClose={onClose}>
      <DialogContent className={css.container}>
        <Typography variant="h5" mb={1}>
          Need to replace or discard this transaction?
        </Typography>
        <Typography variant="body1" textAlign="center">
          A signed transaction cannot be removed but it can be replaced with a new transaction with the same nonce.
        </Typography>
        <Stepper alternativeLabel className={css.stepper}>
          {steps.map(({ label }) => (
            <Step key={label}>
              <StepLabel StepIconComponent={({ icon }) => steps[Number(icon) - 1].icon}>
                <Typography variant="body1" fontWeight={700}>
                  {label}
                </Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </DialogContent>
      <DialogActions className={css.container}>
        <Grid container alignItems="center" justifyContent="center" spacing={3}>
          <Grid item xs={12}>
            <Typography variant="body2" textAlign="center" fontWeight={700}>
              Select the type of replacement transaction
            </Typography>
          </Grid>
          <Grid item xs>
            <SendTokensButton onClick={onTokenModalOpen} sx={{ mb: 1, maxWidth: '320px !important' }} />
            <SendNFTsButton onClick={onNFTModalOpen} />
          </Grid>
          <Grid>
            <Typography variant="body2" textAlign="center" fontWeight={700} p={3}>
              or
            </Typography>
          </Grid>
          <Grid xs>
            <Button onClick={onRejectModalOpen} variant="outlined" fullWidth sx={{ mt: 3 }}>
              Rejection transaction
            </Button>

            <Typography variant="caption">How does it work?</Typography>
            <Tooltip
              title={`An on-chain rejection doesn't send any funds. Executing an on-chain rejection will replace all currently awaiting transactions with nonce ${txNonce}.`}
              arrow
            >
              <span>
                <SvgIcon
                  component={InfoIcon}
                  inheritViewBox
                  fontSize="small"
                  color="border"
                  sx={{ verticalAlign: 'middle', ml: 0.5 }}
                />
              </span>
            </Tooltip>
          </Grid>
        </Grid>
      </DialogActions>
    </ModalDialog>
  )
}

export default ReplacementModal
