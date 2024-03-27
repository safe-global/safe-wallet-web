import type { ReactNode } from 'react'
import { Typography, Card, IconButton, Link, SvgIcon, Grid, Button } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import css from './styles.module.css'
import { useRemoteSafeApps } from '@/hooks/safe-apps/useRemoteSafeApps'
import { SafeAppsTag } from '@/config/constants'
import SafeMilesLogo from '@/public/images/common/safe-miles-logo.svg'
import classNames from 'classnames'
import useChainId from '@/hooks/useChainId'
import { useShareSafeAppUrl } from '@/components/safe-apps/hooks/useShareSafeAppUrl'
import { useDarkMode } from '@/hooks/useDarkMode'

// Chains
export const Chains = {
  MAINNET: '1',
  SEPOLIA: '11155111',
}

// Strictly type configuration for each chain above
type ChainConfig<T> = Record<(typeof Chains)[keyof typeof Chains], T>

const CHAIN_START_TIMESTAMPS: ChainConfig<number> = {
  1: 1713866400000, // 23rd April 2024
  11155111: 1709290800000, // 01st March 2024
}

const JUNE_10_TIMESTAMP = 1718013600000
const SEPTEMBER_10_TIMESTAMP = 1725962400000

const Step = ({ active, title }: { active: boolean; title: ReactNode }) => {
  return (
    <Typography
      className={classNames(css.step, { [css.activeStep]: active })}
      variant="body1"
      fontWeight="bold"
      display="flex"
      gap={1}
    >
      {title}
    </Typography>
  )
}

const ActivityAppSection = () => {
  const chainId = useChainId()
  const [matchingApps] = useRemoteSafeApps(SafeAppsTag.SAFE_GOVERNANCE_APP)
  const isDarkMode = useDarkMode()

  const governanceApp = matchingApps?.[0]
  const today = Date.now()

  const stepsActive = [
    today >= CHAIN_START_TIMESTAMPS[chainId],
    today >= JUNE_10_TIMESTAMP,
    today >= SEPTEMBER_10_TIMESTAMP,
  ]

  const activityAppUrl = useShareSafeAppUrl(governanceApp?.url || '')

  return (
    <Accordion className={css.accordion} defaultExpanded>
      <AccordionSummary
        expandIcon={
          <IconButton size="small">
            <ExpandMoreIcon color="border" />
          </IconButton>
        }
      >
        <Typography component="h2" variant="subtitle1" fontWeight={700}>
          Safe Activity App
        </Typography>
      </AccordionSummary>

      <AccordionDetails>
        {governanceApp && (
          <Card className={css.widgetWrapper}>
            <Grid container xs={12}>
              <Grid item xs={12} md={6} p={0}>
                <SvgIcon
                  component={SafeMilesLogo}
                  inheritViewBox
                  color="border"
                  className={classNames(css.milesIcon, { [css.milesIconLight]: !isDarkMode })}
                />
                <Typography
                  variant="h1"
                  fontWeight={700}
                  mt={4}
                  className={classNames(css.header, { [css.gradientText]: isDarkMode })}
                >
                  Interact with Safe and get rewards
                </Typography>
                <Button variant="contained" sx={{ mt: 3 }} href={activityAppUrl}>
                  Open Activity App
                </Button>
              </Grid>
              <Grid item xs={12} md={6} p={0}>
                <Typography variant="overline" color="primary.light">
                  How it works?
                </Typography>
                <div className={css.steps}>
                  <Step title="Lock SAFE to boost your miles!" active={stepsActive[0]} />
                  <Step
                    title={
                      <>
                        Get activity miles
                        <Typography variant="caption" component="span" className={css.comingSoon}>
                          Coming soon
                        </Typography>
                      </>
                    }
                    active={stepsActive[1]}
                  />
                  <Step title="Receive rewards" active={stepsActive[2]} />
                </div>
                <Link color="primary.main" fontWeight="bold" href={activityAppUrl}>
                  Read more about the program
                </Link>
              </Grid>
            </Grid>
          </Card>
        )}
      </AccordionDetails>
    </Accordion>
  )
}

export default ActivityAppSection
