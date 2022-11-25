import { Typography, Card, Box, Alert } from '@mui/material'
import { WidgetBody } from '@/components/dashboard/styled'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import css from './styles.module.css'
import SafeAppsErrorBoundary from '@/components/safe-apps/SafeAppsErrorBoundary'
import AppFrame from '@/components/safe-apps/AppFrame'
import { useBrowserPermissions } from '@/hooks/safe-apps/permissions'
import { useRemoteSafeApps } from '@/hooks/safe-apps/useRemoteSafeApps'
import { SafeAppsTag } from '@/config/constants'
import LoadIcon from '@/public/images/common/load.svg'
import palette from '@/styles/colors'
import { useDarkMode } from '@/hooks/useDarkMode'

const GovernanceSection = () => {
  const isDarkMode = useDarkMode()
  const theme = isDarkMode ? 'dark' : 'light'
  const { getAllowedFeaturesList } = useBrowserPermissions()
  const [claimingSafeApp, errorFetchingClaimingSafeApp] = useRemoteSafeApps(SafeAppsTag.SAFE_CLAIMING_APP)
  const claimingApp = claimingSafeApp?.[0]
  const fetchingSafeClaimingApp = !claimingApp && !errorFetchingClaimingSafeApp

  const WidgetLoadError = () => (
    <Card className={css.loadErrorCard}>
      <Box height="100%" display="flex" flexDirection="column" alignItems="center" justifyContent="center" gap={2}>
        <LoadIcon fill={`${palette.border.main}`} />
        <Typography variant="body1" color="border.main">
          Couldn&apos;t load governance widget
        </Typography>
      </Box>
    </Card>
  )

  const WidgetLoadErrorFallback = () => (
    <Box className={css.loadErrorWrapper} display="flex" gap={3} width={1} sx={{ backgroundColor: 'background.main' }}>
      <WidgetLoadError />
      <WidgetLoadError />
    </Box>
  )

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
            <Card className={css.widgetWrapper}>
              {claimingApp ? (
                <SafeAppsErrorBoundary render={() => <WidgetLoadErrorFallback />}>
                  <AppFrame
                    appUrl={`${claimingApp.url}?theme=${theme}#widget`}
                    allowedFeaturesList={getAllowedFeaturesList(claimingApp.url)}
                    isQueueBarDisabled
                  />
                </SafeAppsErrorBoundary>
              ) : (
                <Box
                  className={css.widgetWrapper}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  textAlign="center"
                >
                  <Typography variant="h1" color="text.secondary">
                    Loading section...
                  </Typography>
                </Box>
              )}
            </Card>
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
