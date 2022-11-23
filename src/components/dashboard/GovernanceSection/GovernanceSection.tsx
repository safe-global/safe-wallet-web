import { Typography, Grid, Card, Box, Alert } from '@mui/material'
import { WidgetBody } from '@/components/dashboard/styled'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import css from './styles.module.css'
import SafeAppsErrorBoundary from '@/components/safe-apps/SafeAppsErrorBoundary'
import SafeAppsLoadError from '@/components/safe-apps/SafeAppsErrorBoundary/SafeAppsLoadError'
import AppFrame from '@/components/safe-apps/AppFrame'
import { useBrowserPermissions } from '@/hooks/safe-apps/permissions'
import { useRemoteSafeApps } from '@/hooks/safe-apps/useRemoteSafeApps'
import { SafeAppsTag } from '@/config/constants'

const CLAIMING_WIDGET_ID = '#claiming-widget'
const SNAPSHOT_WIDGET_ID = '#snapshot-widget'

const GovernanceSection = () => {
  const { getAllowedFeaturesList } = useBrowserPermissions()
  const [claimingSafeApp, errorFetchingClaimingSafeApp] = useRemoteSafeApps(SafeAppsTag.SAFE_CLAIMING_APP)
  const claimingApp = claimingSafeApp?.[0]
  const fetchingSafeClaimingApp = !claimingApp && !errorFetchingClaimingSafeApp

  return (
    <Accordion className={css.accordion} defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon color="border" />}>
        <div>
          <Typography component="h2" variant="subtitle1" fontWeight={700}>
            Governance
          </Typography>
          <Typography variant="body2" mb={2} color="text.secondary">
            Use your SAFE tokens to vote on important proposals or participate in forum discussions.
          </Typography>
        </div>
      </AccordionSummary>

      <AccordionDetails sx={({ spacing }) => ({ padding: `0 ${spacing(3)}` })}>
        {claimingApp || fetchingSafeClaimingApp ? (
          <WidgetBody>
            <Grid spacing={3} container>
              <Grid item xs={12} md={6} lg={8}>
                <Card sx={{ height: '300px' }}>
                  {claimingApp ? (
                    <SafeAppsErrorBoundary render={() => <SafeAppsLoadError onBackToApps={() => {}} />}>
                      <AppFrame
                        appUrl={`${claimingApp.url}${SNAPSHOT_WIDGET_ID}`}
                        allowedFeaturesList={getAllowedFeaturesList(claimingApp.url)}
                        isQueueBarDisabled
                      />
                    </SafeAppsErrorBoundary>
                  ) : (
                    <Box
                      sx={{ height: '300px' }}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      textAlign="center"
                    >
                      <Typography variant="h1" color="text.secondary">
                        Loading Snapshot...
                      </Typography>
                    </Box>
                  )}
                </Card>
              </Grid>
              <Grid item xs={12} md={6} lg={4}>
                <Card sx={{ height: '300px' }}>
                  {claimingApp ? (
                    <SafeAppsErrorBoundary render={() => <SafeAppsLoadError onBackToApps={() => {}} />}>
                      <AppFrame
                        appUrl={`${claimingApp.url}${CLAIMING_WIDGET_ID}`}
                        allowedFeaturesList={getAllowedFeaturesList(claimingApp.url)}
                        isQueueBarDisabled
                      />
                    </SafeAppsErrorBoundary>
                  ) : (
                    <Box
                      sx={{ height: '300px' }}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      textAlign="center"
                    >
                      <Typography variant="h1" color="text.secondary">
                        Loading Claiming app...
                      </Typography>
                    </Box>
                  )}
                </Card>
              </Grid>
            </Grid>
          </WidgetBody>
        ) : (
          <Alert severity="warning" elevation={3}>
            There was an error fetching the Governance section. Please reload the page.
          </Alert>
        )}
      </AccordionDetails>
    </Accordion>
  )
}

export default GovernanceSection
