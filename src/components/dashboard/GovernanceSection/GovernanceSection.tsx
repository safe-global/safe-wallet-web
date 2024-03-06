import { getSafeTokenAddress } from '@/components/common/SafeTokenWidget'
import { WidgetBody } from '@/components/dashboard/styled'
import SafeAppIframe from '@/components/safe-apps/AppFrame/SafeAppIframe'
import type { UseAppCommunicatorHandlers } from '@/components/safe-apps/AppFrame/useAppCommunicator'
import useAppCommunicator from '@/components/safe-apps/AppFrame/useAppCommunicator'
import useGetSafeInfo from '@/components/safe-apps/AppFrame/useGetSafeInfo'
import { getOrigin } from '@/components/safe-apps/utils'
import { DISCORD_URL, SafeAppsTag } from '@/config/constants'
import { useBrowserPermissions } from '@/hooks/safe-apps/permissions'
import { useRemoteSafeApps } from '@/hooks/safe-apps/useRemoteSafeApps'
import useAsync from '@/hooks/useAsync'
import useChainId from '@/hooks/useChainId'
import { useCurrentChain } from '@/hooks/useChains'
import { useDarkMode } from '@/hooks/useDarkMode'
import useSafeInfo from '@/hooks/useSafeInfo'
import NetworkError from '@/public/images/common/network-error.svg'
import { fetchSafeAppFromManifest } from '@/services/safe-apps/manifest'
import { OpenInNew } from '@mui/icons-material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Alert, Box, Card, IconButton, Link, SvgIcon, Typography } from '@mui/material'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import type { SafeAppData } from '@safe-global/safe-gateway-typescript-sdk'
import { useRef } from 'react'
import css from './styles.module.css'

// A fallback component when the Safe App fails to load
const WidgetLoadErrorFallback = () => (
  <Box data-sid="49503" display="flex" flexDirection="column" alignItems="center" height="100%">
    <Card className={css.loadErrorCard}>
      <Box data-sid="64707" className={css.loadErrorMsgContainer}>
        <Typography variant="h4" color="text.primary" fontWeight="bold">
          Couldn&apos;t load governance widgets
        </Typography>
        <SvgIcon component={NetworkError} inheritViewBox className={css.loadErroricon} />
        <Typography variant="body1" color="text.primary">
          You can try to reload the page and in case the problem persists, please reach out to us via{' '}
          <Link target="_blank" href={DISCORD_URL} fontSize="medium">
            Discord
            <OpenInNew fontSize="small" color="primary" className={css.loadErroricon} />
          </Link>
        </Typography>
      </Box>
    </Card>
  </Box>
)

// A mini Safe App frame with a minimal set of communication handlers
const MiniAppFrame = ({ app, title }: { app: SafeAppData; title: string }) => {
  const chain = useCurrentChain()
  const isDarkMode = useDarkMode()
  const theme = isDarkMode ? 'dark' : 'light'
  const { getAllowedFeaturesList } = useBrowserPermissions()
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const [, error] = useAsync(() => {
    if (!chain?.chainId) return
    return fetchSafeAppFromManifest(app.url, chain.chainId)
  }, [app.url, chain?.chainId])

  // Initialize the app communicator
  useAppCommunicator(iframeRef, app, chain, {
    onGetSafeInfo: useGetSafeInfo(),
  } as Partial<UseAppCommunicatorHandlers> as UseAppCommunicatorHandlers)

  return error ? (
    <WidgetLoadErrorFallback />
  ) : (
    <SafeAppIframe
      key={theme}
      appUrl={`${app.url}/widgets?theme=${theme}`}
      allowedFeaturesList={getAllowedFeaturesList(getOrigin(app.url))}
      title={title}
      iframeRef={iframeRef}
    />
  )
}

// Entire section for the governance widgets
const GovernanceSection = () => {
  const [matchingApps, errorFetchingGovernanceSafeApp] = useRemoteSafeApps(SafeAppsTag.SAFE_GOVERNANCE_APP)
  const governanceApp = matchingApps?.[0]
  const fetchingSafeGovernanceApp = !governanceApp && !errorFetchingGovernanceSafeApp
  const { safeLoading } = useSafeInfo()

  return (
    <Accordion className={css.accordion} defaultExpanded>
      <AccordionSummary
        expandIcon={
          <IconButton size="small">
            <ExpandMoreIcon color="border" />
          </IconButton>
        }
      >
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
        {governanceApp || fetchingSafeGovernanceApp ? (
          <WidgetBody>
            <Card className={css.widgetWrapper}>
              {governanceApp && !safeLoading ? (
                <MiniAppFrame app={governanceApp} title="Safe Governance" />
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

// Prevent `GovernanceSection` hooks from needlessly being called
const GovernanceSectionWrapper = () => {
  const chainId = useChainId()
  if (!getSafeTokenAddress(chainId)) {
    return null
  }

  return <GovernanceSection />
}

export default GovernanceSectionWrapper
