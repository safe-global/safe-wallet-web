import type { ReactNode } from 'react'
import { Typography, Card, IconButton, SvgIcon, Grid, Button, Link, Box } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import css from './styles.module.css'
import { useRemoteSafeApps } from '@/hooks/safe-apps/useRemoteSafeApps'
import { SafeAppsTag } from '@/config/constants'
import SafePass from '@/public/images/common/safe-pass-logo.svg'

import classNames from 'classnames'
import { useDarkMode } from '@/hooks/useDarkMode'
import { useRouter } from 'next/router'
import { getSafeAppUrl } from '@/components/safe-apps/SafeAppCard'
import NextLink from 'next/link'
import { OVERVIEW_EVENTS, trackEvent } from '@/services/analytics'
import { useHasFeature } from '@/hooks/useChains'
import { FEATURES } from '@/utils/chains'

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

const ActivityRewardsSection = () => {
  const [matchingApps] = useRemoteSafeApps(SafeAppsTag.SAFE_GOVERNANCE_APP)
  const isDarkMode = useDarkMode()
  const router = useRouter()

  const isSAPBannerEnabled = useHasFeature(FEATURES.SAP_BANNER)
  const governanceApp = matchingApps?.[0]

  if (!governanceApp || !governanceApp?.url || !isSAPBannerEnabled) return null

  const appUrl = getSafeAppUrl(router, governanceApp?.url)

  const onClick = () => {
    trackEvent(OVERVIEW_EVENTS.OPEN_ACTIVITY_APP)
  }

  return (
    <Grid item xs={12}>
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
          <Card className={css.widgetWrapper}>
            <Grid container xs={12} sx={{ gap: { xs: 4, md: 0 } }}>
              <Grid item xs={12} md={6} p={0}>
                <SvgIcon
                  component={SafePass}
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
                <Box className={css.links} gap={2}>
                  <NextLink href={appUrl} passHref rel="noreferrer" onClick={onClick}>
                    <Button variant="contained">Open Activity App</Button>
                  </NextLink>
                  {/** TODO: insert link to landing page once it exists */}
                  <Link underline="hover" color="text.primary" fontWeight="bold" href="">
                    Read about the program
                  </Link>
                </Box>
              </Grid>
              <Grid item xs={12} md={6} p={0}>
                <Typography variant="overline" color="primary.light">
                  How it works
                </Typography>
                <div className={css.steps}>
                  <Step title="Lock SAFE to boost your points!" active={true} />
                  <Step
                    title={
                      <>
                        Get activity points
                        <Typography variant="caption" component="span" className={css.comingSoon}>
                          Coming soon
                        </Typography>
                      </>
                    }
                    active={false}
                  />
                  <Step title="Receive rewards" active={false} />
                </div>
              </Grid>
            </Grid>
          </Card>
        </AccordionDetails>
      </Accordion>
    </Grid>
  )
}

export default ActivityRewardsSection
