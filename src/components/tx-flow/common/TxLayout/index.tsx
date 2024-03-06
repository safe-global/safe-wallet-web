import ChainIndicator from '@/components/common/ChainIndicator'
import { ProgressBar } from '@/components/common/ProgressBar'
import { TxInfoProvider } from '@/components/tx-flow/TxInfoProvider'
import SecurityWarnings from '@/components/tx/security/SecurityWarnings'
import { TxSecurityProvider } from '@/components/tx/security/shared/TxSecurityContext'
import useSafeInfo from '@/hooks/useSafeInfo'
import SafeLogo from '@/public/images/logo-no-text.svg'
import { Box, Button, Container, Grid, IconButton, Paper, SvgIcon, Typography, useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import type { TransactionSummary } from '@safe-global/safe-gateway-typescript-sdk'
import classnames from 'classnames'
import { useContext, useEffect, useState, type ComponentType, type ReactElement, type ReactNode } from 'react'
import SafeTxProvider, { SafeTxContext } from '../../SafeTxProvider'
import TxNonce from '../TxNonce'
import TxStatusWidget from '../TxStatusWidget'
import css from './styles.module.css'

const TxLayoutHeader = ({
  hideNonce,
  icon,
  subtitle,
}: {
  hideNonce: TxLayoutProps['hideNonce']
  icon: TxLayoutProps['icon']
  subtitle: TxLayoutProps['subtitle']
}) => {
  const { safe } = useSafeInfo()
  const { nonceNeeded } = useContext(SafeTxContext)

  if (hideNonce && !icon && !subtitle) return null

  return (
    <Box data-sid="28491" className={css.headerInner}>
      <Box data-sid="30529" display="flex" alignItems="center">
        {icon && (
          <div data-sid="49428" className={css.icon}>
            <SvgIcon component={icon} inheritViewBox />
          </div>
        )}

        <Typography variant="h4" component="div" fontWeight="bold">
          {subtitle}
        </Typography>
      </Box>

      {!hideNonce && safe.deployed && nonceNeeded && <TxNonce />}
    </Box>
  )
}

type TxLayoutProps = {
  title: ReactNode
  children: ReactNode
  subtitle?: ReactNode
  icon?: ComponentType
  step?: number
  txSummary?: TransactionSummary
  onBack?: () => void
  hideNonce?: boolean
  hideProgress?: boolean
  isBatch?: boolean
  isReplacement?: boolean
  isMessage?: boolean
  isRecovery?: boolean
}

const TxLayout = ({
  title,
  subtitle,
  icon,
  children,
  step = 0,
  txSummary,
  onBack,
  hideNonce = false,
  hideProgress = false,
  isBatch = false,
  isReplacement = false,
  isMessage = false,
}: TxLayoutProps): ReactElement => {
  const [statusVisible, setStatusVisible] = useState<boolean>(true)

  const theme = useTheme()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'))

  const steps = Array.isArray(children) ? children : [children]
  const progress = Math.round(((step + 1) / steps.length) * 100)

  useEffect(() => {
    setStatusVisible(!isSmallScreen)
  }, [isSmallScreen])

  const toggleStatus = () => {
    setStatusVisible((prev) => !prev)
  }

  return (
    <SafeTxProvider>
      <TxInfoProvider>
        <TxSecurityProvider>
          <>
            {/* Header status button */}
            <IconButton
              className={css.statusButton}
              aria-label="Transaction status"
              size="large"
              onClick={toggleStatus}
            >
              <SafeLogo width={16} height={16} />
            </IconButton>

            <Container className={css.container}>
              <Grid container gap={3} justifyContent="center">
                {/* Main content */}
                <Grid item xs={12} md={7}>
                  <div data-sid="36618" className={css.titleWrapper}>
                    <Typography
                      data-testid="modal-title"
                      variant="h3"
                      component="div"
                      fontWeight="700"
                      className={css.title}
                    >
                      {title}
                    </Typography>

                    <ChainIndicator inline />
                  </div>

                  <Paper data-testid="modal-header" className={css.header}>
                    {!hideProgress && (
                      <Box data-sid="22602" className={css.progressBar}>
                        <ProgressBar value={progress} />
                      </Box>
                    )}

                    <TxLayoutHeader subtitle={subtitle} icon={icon} hideNonce={hideNonce} />
                  </Paper>

                  <div data-sid="25464" className={css.step}>
                    {steps[step]}

                    {onBack && step > 0 && (
                      <Button
                        data-sid="13724"
                        data-testid="modal-back-btn"
                        variant="contained"
                        onClick={onBack}
                        className={css.backButton}
                      >
                        Back
                      </Button>
                    )}
                  </div>
                </Grid>

                {/* Sidebar */}
                <Grid item xs={12} md={4} className={classnames(css.widget, { [css.active]: statusVisible })}>
                  {statusVisible && (
                    <TxStatusWidget
                      step={step}
                      txSummary={txSummary}
                      handleClose={() => setStatusVisible(false)}
                      isReplacement={isReplacement}
                      isBatch={isBatch}
                      isMessage={isMessage}
                    />
                  )}

                  <Box data-sid="20816" className={css.sticky}>
                    <SecurityWarnings />
                  </Box>
                </Grid>
              </Grid>
            </Container>
          </>
        </TxSecurityProvider>
      </TxInfoProvider>
    </SafeTxProvider>
  )
}

export default TxLayout
