import { Button, SvgIcon, Tooltip, Typography, Stepper, Step, StepLabel, Grid } from '@mui/material'

import InfoIcon from '@/public/images/notifications/info.svg'
import RocketIcon from '@/public/images/transactions/rocket.svg'
import CheckIcon from '@mui/icons-material/Check'
import DeleteIcon from '@/public/images/common/delete.svg'
import { SendTokensButton } from '@/components/tx/modals/NewTxModal/TxButton'
import { useQueuedTxByNonce } from '@/hooks/useTxQueue'
import { isCustomTxInfo } from '@/utils/transaction-guards'

import css from './styles.module.css'
import Link from 'next/link'
import { type UrlObject } from 'url'
import { AppRoutes } from '@/config/routes'
import { useRouter } from 'next/router'

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

const btnWidth = {
  width: {
    xs: 240,
    sm: '100%',
  },
}

const ReplaceTx = ({ txNonce }: { txNonce?: number }) => {
  const router = useRouter()
  const queuedTxsByNonce = useQueuedTxByNonce(txNonce)
  const canCancel = !queuedTxsByNonce?.some(
    (item) => isCustomTxInfo(item.transaction.txInfo) && item.transaction.txInfo.isCancellation,
  )

  const sendTokensLink: UrlObject = {
    pathname: AppRoutes.newTx.sendTokens,
    query: { safe: router.query.safe, nonce: txNonce },
  }

  const rejectTxLink: UrlObject = {
    pathname: AppRoutes.newTx.reject,
    query: { safe: router.query.safe, nonce: txNonce },
  }

  return (
    <div>
      <div className={css.container}>
        <Typography variant="h5" mb={1} textAlign="center">
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
      </div>
      <div className={css.container}>
        <Grid container alignItems="center" justifyContent="center" flexDirection="row">
          <Grid item xs={12}>
            <Typography variant="body2" textAlign="center" fontWeight={700} mb={3}>
              Select how you would like to replace this transaction
            </Typography>
          </Grid>
          <Grid item container justifyContent="center" alignItems="center" gap={1} xs={12} sm flexDirection="row">
            <Link href={sendTokensLink} passHref>
              <SendTokensButton sx={btnWidth} />
            </Link>
          </Grid>
          <Grid item>
            <Typography variant="body2" className={css.or}>
              or
            </Typography>
          </Grid>
          <Grid
            item
            container
            xs={12}
            sm
            justifyContent={{
              xs: 'center',
              sm: 'flex-start',
            }}
            alignItems="center"
            textAlign="center"
            flexDirection="row"
          >
            <Tooltip
              arrow
              placement="top"
              title={canCancel ? '' : `Transaction with nonce ${txNonce} already has a reject transaction`}
            >
              <Link href={rejectTxLink} passHref>
                <Button
                  onClick={() => console.log('Implement me')}
                  variant="outlined"
                  fullWidth
                  sx={{ mb: 1, ...btnWidth }}
                  disabled={!canCancel}
                >
                  Reject transaction
                </Button>
              </Link>
            </Tooltip>

            <div>
              <Typography variant="caption" display="flex" alignItems="center">
                How does it work?{' '}
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
              </Typography>
            </div>
          </Grid>
        </Grid>
      </div>
    </div>
  )
}

export default ReplaceTx
