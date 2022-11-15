import { Typography, Grid, Card, Box } from '@mui/material'
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

export type WidgetType = {
  appId: string
  appUrl: string
  widgetType?: 'iframe'
}

// TODO: use remote safe apps endpoint and the 'dashboard-mini-app' tag
export const appWidgets: WidgetType[] = [
  {
    appId: '1',
    appUrl: 'https://swap.cow.fi/',
  },
  {
    appId: '2',
    appUrl: 'http://localhost:3001/safe-claiming-app#widget',
  },
]

const GovernanceSection = () => {
  const { getAllowedFeaturesList } = useBrowserPermissions()

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
                  <Box m={2}>
                    <Typography variant="h3">
                      <strong>Snapshot</strong>
                    </Typography>
                  </Box>
                </Card>
              </Grid>
              <Grid item xs={4}>
                <Card sx={{ height: '300px' }}>
                  <SafeAppsErrorBoundary render={() => <SafeAppsLoadError onBackToApps={() => {}} />}>
                    <AppFrame
                      appUrl={appWidgets[1].appUrl}
                      allowedFeaturesList={getAllowedFeaturesList(appWidgets[1].appUrl)}
                      isQueueBarDisabled={true}
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
