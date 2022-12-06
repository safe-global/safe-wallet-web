import { Typography, Card, Box, Alert, IconButton, Link, SvgIcon } from '@mui/material'
import { WidgetBody } from '@/components/dashboard/styled'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import css from './styles.module.css'
import SafeAppsErrorBoundary from '@/components/safe-apps/SafeAppsErrorBoundary'
import { useBrowserPermissions } from '@/hooks/safe-apps/permissions'
import { useRemoteSafeApps } from '@/hooks/safe-apps/useRemoteSafeApps'
import { SafeAppsTag, SAFE_APPS_SUPPORT_CHAT_URL } from '@/config/constants'
import { useDarkMode } from '@/hooks/useDarkMode'
import { OpenInNew } from '@mui/icons-material'
import NetworkError from '@/public/images/common/network-error.svg'
import useChainId from '@/hooks/useChainId'
import { getSafeTokenAddress } from '@/components/common/SafeTokenWidget'
import SafeAppIframe from '@/components/safe-apps/AppFrame/SafeAppIframe'
import type { UseAppCommunicatorHandlers } from '@/components/safe-apps/AppFrame/useAppCommunicator'
import useAppCommunicator from '@/components/safe-apps/AppFrame/useAppCommunicator'
import useSafeInfo from '@/hooks/useSafeInfo'
import useIsGranted from '@/hooks/useIsGranted'
import { getLegacyChainName } from '@/components/safe-apps/utils'
import { useCurrentChain } from '@/hooks/useChains'
import useAppIsLoading from '@/components/safe-apps/AppFrame/useAppIsLoading'

// Prevent `GovernanceSection` hooks from needlessly being called
const GovernanceSectionWrapper = () => {
  const chainId = useChainId()
  if (!getSafeTokenAddress(chainId)) {
    return null
  }

  return <GovernanceSection />
}

const GovernanceSection = () => {
  const isDarkMode = useDarkMode()
  const theme = isDarkMode ? 'dark' : 'light'
  const { getAllowedFeaturesList } = useBrowserPermissions()
  const { safe, safeAddress } = useSafeInfo()
  const granted = useIsGranted()
  const chain = useCurrentChain()
  const [matchingApps, errorFetchingClaimingSafeApp] = useRemoteSafeApps(SafeAppsTag.SAFE_CLAIMING_APP)
  const claimingApp = matchingApps?.[0]
  const { iframeRef, setAppIsLoading } = useAppIsLoading()
  const fetchingSafeClaimingApp = !claimingApp && !errorFetchingClaimingSafeApp

  // Initialize the app communicator
  useAppCommunicator(iframeRef, claimingApp, chain, {
    onGetSafeInfo: () => ({
      safeAddress,
      chainId: chain ? parseInt(chain.chainId, 10) : -1,
      owners: safe.owners.map((owner) => owner.value),
      threshold: safe.threshold,
      isReadOnly: !granted,
      network: chain ? getLegacyChainName(chain.chainName || '', chain.chainId).toUpperCase() : '',
    }),
  } as Partial<UseAppCommunicatorHandlers> as UseAppCommunicatorHandlers)

  const WidgetLoadError = () => (
    <Card className={css.loadErrorCard}>
      <Box className={css.loadErrorMsgContainer}>
        <Typography variant="h4" color="text.primary" fontWeight="bold">
          Couldn&apos;t load governance widgets
        </Typography>
        <SvgIcon component={NetworkError} inheritViewBox className={css.loadErroricon} />
        <Typography variant="body1" color="text.primary">
          You can try to reload the page and in case the problem persists, please reach out to us via{' '}
          <Link target="_blank" href={SAFE_APPS_SUPPORT_CHAT_URL} fontSize="medium">
            Discord
            <OpenInNew fontSize="small" color="primary" className={css.loadErroricon} />
          </Link>
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
        {claimingApp || fetchingSafeClaimingApp ? (
          <WidgetBody>
            <Card className={css.widgetWrapper}>
              {claimingApp ? (
                <SafeAppsErrorBoundary render={() => <WidgetLoadErrorFallback />}>
                  <SafeAppIframe
                    key={theme}
                    appUrl={`${claimingApp.url}#widget+${theme}`}
                    allowedFeaturesList={getAllowedFeaturesList(claimingApp.url)}
                    title="Sage Governance"
                    iframeRef={iframeRef}
                    onLoad={() => setAppIsLoading(false)}
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

export default GovernanceSectionWrapper
