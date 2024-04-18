import type { ReactNode } from 'react'
import { Typography, Card, SvgIcon, Grid, Button, Box } from '@mui/material'
import css from './styles.module.css'
import { useRemoteSafeApps } from '@/hooks/safe-apps/useRemoteSafeApps'
import { SafeAppsTag } from '@/config/constants'
import SafePass from '@/public/images/common/safe-pass-logo.svg'
import Asterix from '@/public/images/common/asterix.svg'

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
      {!active && (
        <Typography variant="caption" component="span" className={css.comingSoon}>
          Coming soon
        </Typography>
      )}
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
      <Card className={css.widgetWrapper}>
        <SvgIcon
          component={Asterix}
          inheritViewBox
          sx={{
            color: 'transparent',
            position: 'absolute',
            top: 0,
            right: 0,
            height: '208px',
            width: 'inherit',
            display: { xs: 'none', sm: 'block' },
          }}
        />
        <Grid container xs={12} sx={{ gap: { xs: 4, lg: 0 } }}>
          <Grid item xs={12} lg={6} p={0}>
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
                <Button variant="contained">{'Get Safe{Pass}'}</Button>
              </NextLink>
              <NextLink href="https://safe.global/pass" target="_blank" passHref rel="noreferrer" onClick={onClick}>
                <Button variant="outlined">Learn more</Button>
              </NextLink>
            </Box>
          </Grid>
          <Grid item xs={12} lg={6} p={0}>
            <Typography variant="overline" color="primary.light">
              How it works
            </Typography>
            <div className={css.steps}>
              <Step title="Lock SAFE to boost your points!" active={true} />
              <Step title="Get activity points" active={false} />
              <Step title="Receive rewards" active={false} />
            </div>
          </Grid>
        </Grid>
      </Card>
    </Grid>
  )
}

export default ActivityRewardsSection
