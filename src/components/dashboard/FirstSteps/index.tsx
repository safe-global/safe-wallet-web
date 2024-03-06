import { BuyCryptoOptions } from '@/components/common/BuyCryptoButton'
import EthHashInfo from '@/components/common/EthHashInfo'
import ModalDialog from '@/components/common/ModalDialog'
import QRCode from '@/components/common/QRCode'
import Track from '@/components/common/Track'
import { Card, WidgetBody, WidgetContainer } from '@/components/dashboard/styled'
import FirstTxFlow from '@/features/counterfactual/FirstTxFlow'
import useBalances from '@/hooks/useBalances'
import { useCurrentChain } from '@/hooks/useChains'
import useSafeInfo from '@/hooks/useSafeInfo'
import { OVERVIEW_EVENTS } from '@/services/analytics'
import { useAppDispatch, useAppSelector } from '@/store'
import { selectSettings, setQrShortName } from '@/store/settingsSlice'
import { selectOutgoingTransactions } from '@/store/txHistorySlice'
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined'
import { Box, Button, CircularProgress, Divider, FormControlLabel, Grid, Switch, Typography } from '@mui/material'
import classnames from 'classnames'
import { useState, type ReactNode } from 'react'
import css from './styles.module.css'

const calculateProgress = (items: boolean[]) => {
  const totalNumberOfItems = items.length
  const completedItems = items.filter((item) => item)
  return Math.round((completedItems.length / totalNumberOfItems) * 100)
}

const StatusCard = ({
  badge,
  title,
  content,
  completed,
  children,
}: {
  badge: string
  title: string
  content: string
  completed: boolean
  children: ReactNode
}) => {
  return (
    <Card className={css.card}>
      <div data-sid="19050" className={css.topBadge}>
        <Typography variant="body2">{badge}</Typography>
      </div>
      <div data-sid="50029" className={css.status}>
        {completed ? (
          <CheckCircleRoundedIcon color="success" fontSize="medium" />
        ) : (
          <CircleOutlinedIcon color="inherit" fontSize="medium" />
        )}
      </div>
      <Typography variant="h4" fontWeight="bold" mb={2}>
        {title}
      </Typography>
      <Typography>{content}</Typography>
      {children}
    </Card>
  )
}

const AddFundsWidget = ({ completed }: { completed: boolean }) => {
  const [open, setOpen] = useState<boolean>(false)
  const { safeAddress } = useSafeInfo()
  const chain = useCurrentChain()
  const dispatch = useAppDispatch()
  const settings = useAppSelector(selectSettings)
  const qrPrefix = settings.shortName.qr ? `${chain?.shortName}:` : ''
  const qrCode = `${qrPrefix}${safeAddress}`

  const title = 'Add native assets'
  const content = `Receive ${chain?.nativeCurrency.name} to start interacting with your account.`

  const toggleDialog = () => {
    setOpen((prev) => !prev)
  }

  return (
    <StatusCard badge="First interaction" title={title} content={content} completed={completed}>
      {!completed && (
        <>
          <Box data-sid="41093" mt={2}>
            <Track {...OVERVIEW_EVENTS.ADD_FUNDS}>
              <Button
                data-sid="20462"
                onClick={toggleDialog}
                variant="contained"
                size="small"
                sx={{ minHeight: '40px' }}
              >
                Add funds
              </Button>
            </Track>
          </Box>
          <ModalDialog
            open={open}
            onClose={toggleDialog}
            dialogTitle="Add funds to your Safe Account"
            hideChainIndicator
          >
            <Box data-sid="78638" px={4} pb={5} pt={4}>
              <Grid container spacing={2} alignItems="center" justifyContent="center" mb={4}>
                <Grid item textAlign="center">
                  <Box
                    data-sid="61202"
                    p={1}
                    border={1}
                    borderRadius="6px"
                    borderColor="border.light"
                    display="inline-flex"
                  >
                    <QRCode value={qrCode} size={132} />
                  </Box>
                  <Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.shortName.qr}
                          onChange={(e) => dispatch(setQrShortName(e.target.checked))}
                        />
                      }
                      label={
                        <>
                          QR code with chain prefix (<b>{chain?.shortName}:</b>)
                        </>
                      }
                    />
                  </Box>
                </Grid>
                <Grid item xs>
                  <Typography mb={2}>
                    Add funds directly from your bank account or copy your address to send tokens from a different
                    account.
                  </Typography>

                  <Box
                    data-sid="36110"
                    bgcolor="background.main"
                    p={2}
                    borderRadius="6px"
                    alignSelf="flex-start"
                    fontSize="14px"
                  >
                    <EthHashInfo
                      address={safeAddress}
                      showName={false}
                      shortAddress={false}
                      showCopyButton
                      hasExplorer
                      avatarSize={24}
                    />
                  </Box>
                </Grid>
              </Grid>

              <Box data-sid="28763" mb={4} position="relative" textAlign="center">
                <Typography className={css.orDivider}>or</Typography>
                <Divider />
              </Box>

              <Typography mb={2}>Buy crypto with fiat:</Typography>
              <BuyCryptoOptions />
            </Box>
          </ModalDialog>
        </>
      )}
    </StatusCard>
  )
}

const FirstTransactionWidget = ({ completed }: { completed: boolean }) => {
  const [open, setOpen] = useState<boolean>(false)

  const title = 'Create your first transaction'
  const content = 'Simply send funds, add a new signer or swap tokens through a safe app.'

  return (
    <>
      <StatusCard badge="First interaction" title={title} content={content} completed={completed}>
        {!completed && (
          <Track {...OVERVIEW_EVENTS.NEW_TRANSACTION} label="onboarding">
            <Button
              data-sid="74285"
              onClick={() => setOpen(true)}
              variant="outlined"
              size="small"
              sx={{ mt: 2, minHeight: '40px' }}
            >
              Create transaction
            </Button>
          </Track>
        )}
      </StatusCard>
      <FirstTxFlow open={open} onClose={() => setOpen(false)} />
    </>
  )
}

const AccountReadyWidget = () => {
  return (
    <Card className={classnames(css.card, css.accountReady)}>
      <div data-sid="95014" className={classnames(css.checkIcon)}>
        <CheckCircleOutlineRoundedIcon sx={{ width: '60px', height: '60px' }} />
      </div>
      <Typography variant="h4" fontWeight="bold" mb={2} mt={2}>
        Safe Account is ready!
      </Typography>
      <Typography>Continue to improve your account security and unlock more features</Typography>
    </Card>
  )
}

const FirstSteps = () => {
  const { balances } = useBalances()
  const { safe } = useSafeInfo()
  const outgoingTransactions = useAppSelector(selectOutgoingTransactions)

  const hasNonZeroBalance = balances && (balances.items.length > 1 || BigInt(balances.items[0]?.balance || 0) > 0)
  const hasOutgoingTransactions = !!outgoingTransactions && outgoingTransactions.length > 0
  const completedItems = [hasNonZeroBalance, hasOutgoingTransactions]

  const progress = calculateProgress(completedItems)
  const stepsCompleted = completedItems.filter((item) => item).length

  if (safe.deployed) return null

  return (
    <WidgetContainer>
      <WidgetBody data-testid="activation-section">
        <Grid container gap={3} mb={2} flexWrap="nowrap" alignItems="center">
          <Grid item position="relative" display="inline-flex">
            <svg className={css.gradient}>
              <defs>
                <linearGradient
                  id="progress_gradient"
                  x1="21.1648"
                  y1="8.21591"
                  x2="-9.95028"
                  y2="22.621"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#5FDDFF" />
                  <stop offset="1" stopColor="#12FF80" />
                </linearGradient>
              </defs>
            </svg>
            <CircularProgress variant="determinate" value={100} className={css.circleBg} size={60} thickness={5} />
            <CircularProgress
              variant="determinate"
              value={progress === 0 ? 3 : progress} // Just to give an indication of the progress even at 0%
              className={css.circleProgress}
              size={60}
              thickness={5}
              sx={{ 'svg circle': { stroke: 'url(#progress_gradient)', strokeLinecap: 'round' } }}
            />
          </Grid>
          <Grid item>
            <Typography component="div" variant="h2" fontWeight={700} mb={1}>
              Activate your Safe Account
            </Typography>
            <Typography variant="body2">
              <strong>
                {stepsCompleted} of {completedItems.length} steps completed.
              </strong>{' '}
              Finish the next steps to start using all Safe Account features:
            </Typography>
          </Grid>
        </Grid>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <AddFundsWidget completed={hasNonZeroBalance} />
          </Grid>

          <Grid item xs={12} md={4}>
            <FirstTransactionWidget completed={hasOutgoingTransactions} />
          </Grid>

          <Grid item xs={12} md={4}>
            <AccountReadyWidget />
          </Grid>
        </Grid>
      </WidgetBody>
    </WidgetContainer>
  )
}

export default FirstSteps
