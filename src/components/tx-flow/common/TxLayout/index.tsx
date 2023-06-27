import { type ComponentType, type ReactElement, type ReactNode, useEffect, useState } from 'react'
import { Box, Container, Grid, Typography, Button, Paper, SvgIcon, IconButton, useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import type { TransactionSummary } from '@safe-global/safe-gateway-typescript-sdk'
import classnames from 'classnames'
import { ProgressBar } from '@/components/common/ProgressBar'
import SafeTxProvider from '../../SafeTxProvider'
import { TxInfoProvider } from '@/components/tx-flow/TxInfoProvider'
import TxNonce from '../TxNonce'
import TxStatusWidget from '../TxStatusWidget'
import css from './styles.module.css'
import { TxSimulationMessage } from '@/components/tx/security/tenderly'
import SafeLogo from '@/public/images/logo-no-text.svg'
import { RedefineMessage } from '@/components/tx/security/redefine'
import { TxSecurityProvider } from '@/components/tx/security/shared/TxSecurityContext'

type TxLayoutProps = {
  title: ReactNode
  children: ReactNode
  subtitle?: ReactNode
  icon?: ComponentType
  step?: number
  txSummary?: TransactionSummary
  onBack?: () => void
  hideNonce?: boolean
  isReplacement?: boolean
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
  isReplacement = false,
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
          <Container className={css.container}>
            <Grid container alignItems="center" justifyContent="center">
              <Grid item xs={12}>
                <Typography variant="h3" component="div" fontWeight="700" mb={2} className={css.title}>
                  {title}
                </Typography>
                <IconButton
                  className={css.statusButton}
                  aria-label="Transaction status"
                  size="large"
                  onClick={toggleStatus}
                >
                  <SafeLogo width={16} height={16} />
                </IconButton>
              </Grid>

              <Grid item container xs={12} gap={3}>
                <Grid item xs={12} md={7}>
                  <Paper className={css.header}>
                    <Box className={css.progressBar}>
                      <ProgressBar value={progress} />
                    </Box>

                    {!hideNonce || icon || subtitle ? (
                      <Box className={css.headerInner}>
                        <Box display="flex" alignItems="center">
                          {icon && (
                            <div className={css.icon}>
                              <SvgIcon component={icon} inheritViewBox />
                            </div>
                          )}

                          <Typography variant="h4" component="div" fontWeight="bold">
                            {subtitle}
                          </Typography>
                        </Box>

                        {!hideNonce && <TxNonce />}
                      </Box>
                    ) : null}
                  </Paper>

                  <div className={css.step}>
                    {steps[step]}

                    {onBack && step > 0 && (
                      <Button variant="contained" onClick={onBack} className={css.backButton}>
                        Back
                      </Button>
                    )}
                  </div>
                </Grid>

                <Grid item xs={12} md={4} className={classnames(css.widget, { [css.active]: statusVisible })}>
                  {statusVisible && (
                    <TxStatusWidget
                      step={step}
                      txSummary={txSummary}
                      handleClose={() => setStatusVisible(false)}
                      isReplacement={isReplacement}
                    />
                  )}

                  <Box mt={2}>
                    <RedefineMessage />
                  </Box>

                  <Box mt={2}>
                    <TxSimulationMessage />
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Container>
        </TxSecurityProvider>
      </TxInfoProvider>
    </SafeTxProvider>
  )
}

export default TxLayout
