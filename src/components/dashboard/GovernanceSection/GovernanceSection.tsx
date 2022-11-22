import { Typography, Grid, Card, Box, Paper, Alert } from '@mui/material'
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
        {fetchingSafeClaimingApp ? (
          <Paper>
            <Box sx={{ height: '300px' }} display="flex" alignItems="center" justifyContent="center">
              <Typography variant="h1" color="text.secondary">
                Loading Safe Claiming App...
              </Typography>
            </Box>
          </Paper>
        ) : claimingApp ? (
          <WidgetBody>
            <Grid spacing={3} container>
              <Grid item xs={12} md={6} lg={8}>
                <Card sx={{ height: '300px' }}>
                  <SafeAppsErrorBoundary render={() => <SafeAppsLoadError onBackToApps={() => {}} />}>
                    <AppFrame
                      appUrl={`${claimingApp.url}#snapshot-widget`}
                      allowedFeaturesList={getAllowedFeaturesList(claimingApp.url)}
                      isQueueBarDisabled
                    />
                  </SafeAppsErrorBoundary>
                </Card>
              </Grid>
              <Grid item xs={12} md={6} lg={4}>
                <Card sx={{ height: '300px' }}>
                  <SafeAppsErrorBoundary render={() => <SafeAppsLoadError onBackToApps={() => {}} />}>
                    <AppFrame
                      appUrl={`${claimingApp.url}#claiming-widget`}
                      allowedFeaturesList={getAllowedFeaturesList(claimingApp.url)}
                      isQueueBarDisabled
                    />
                  </SafeAppsErrorBoundary>
                </Card>
              </Grid>
            </Grid>
          </WidgetBody>
        ) : (
          <Alert severity="info" elevation={3}>
            There was an error fetching the Governance widget. Please reload the page.
          </Alert>
        )}
      </AccordionDetails>
    </Accordion>
  )
}

export default GovernanceSection
