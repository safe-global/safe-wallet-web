import { Typography, Grid, Card, Box, Paper } from '@mui/material'
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
  const [claimingSafeApp, , loadingclaimingSafeApp] = useRemoteSafeApps(SafeAppsTag.SAFE_CLAIMING_APP)
  const claimingApp = claimingSafeApp?.[0]

  if (loadingclaimingSafeApp) {
    return (
      <Paper>
        <Box sx={{ height: '300px' }} display="flex" alignItems="center" justifyContent="center">
          <Typography variant="h1" color="text.secondary">
            Loading Safe Claiming App...
          </Typography>
        </Box>
      </Paper>
    )
  }

  if (!claimingApp) {
    return null
  }

  return (
    <Grid item xs={12} md>
      <Accordion className={css.accordion}>
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
          <WidgetBody>
            <Grid spacing={3} container>
              <Grid item xs={8}>
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
              <Grid item xs={4}>
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
        </AccordionDetails>
      </Accordion>
    </Grid>
  )
}

export default GovernanceSection
