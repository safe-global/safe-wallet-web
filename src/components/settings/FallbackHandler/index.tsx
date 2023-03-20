import { Typography, Box, SvgIcon, Tooltip, Grid, Paper } from '@mui/material'
import semverSatisfies from 'semver/functions/satisfies'
import { useMemo } from 'react'
import type { ReactElement } from 'react'

import EthHashInfo from '@/components/common/EthHashInfo'
import AlertIcon from '@/public/images/common/alert.svg'
import useSafeInfo from '@/hooks/useSafeInfo'
import { getFallbackHandlerDeployment } from '@safe-global/safe-deployments'
import { LATEST_SAFE_VERSION } from '@/config/constants'
import ExternalLink from '@/components/common/ExternalLink'

import css from '../SafeModules/styles.module.css'

const FALLBACK_HANDLER_VERSION = '>=1.1.1'
const FALLBACK_HANDLER_ARTICLE =
  'https://help.gnosis-safe.io/en/articles/4738352-what-is-a-fallback-handler-and-how-does-it-relate-to-the-gnosis-safe'

export const FallbackHandler = (): ReactElement | null => {
  const { safe } = useSafeInfo()

  const supportsFallbackHandler = !!safe.version && semverSatisfies(safe.version, FALLBACK_HANDLER_VERSION)

  const fallbackHandler = safe.fallbackHandler?.value
  const fallbackHandlerDeployment = useMemo(() => {
    return getFallbackHandlerDeployment({
      version: safe.version || LATEST_SAFE_VERSION,
      network: safe.chainId,
    })
  }, [safe.version, safe.chainId])

  if (!supportsFallbackHandler) {
    return null
  }

  const shouldWarn = fallbackHandler ? fallbackHandler !== fallbackHandlerDeployment?.defaultAddress : false

  return (
    <Paper sx={{ padding: 4 }}>
      <Grid container direction="row" justifyContent="space-between" spacing={3}>
        <Grid item lg={4} xs={12}>
          <Typography variant="h4" fontWeight={700}>
            Fallback handler
            {shouldWarn && (
              <Tooltip placement="top" title="An unofficial fallback handler is currently set.">
                <span>
                  <SvgIcon
                    component={AlertIcon}
                    inheritViewBox
                    fontSize="small"
                    color="warning"
                    sx={{ verticalAlign: 'middle', ml: 0.5 }}
                  />
                </span>
              </Tooltip>
            )}
          </Typography>
        </Grid>

        <Grid item xs>
          <Box>
            <Typography>
              The fallback handler adds fallback logic for funtionality that may not be present in the Safe contract.
              Learn more about the fallback handler here{' '}
              <ExternalLink href={FALLBACK_HANDLER_ARTICLE}>here</ExternalLink>
            </Typography>
            {fallbackHandler ? (
              <Box className={css.container}>
                <EthHashInfo shortAddress={false} address={fallbackHandler} showCopyButton hasExplorer />
              </Box>
            ) : (
              <Typography mt={2} color={({ palette }) => palette.primary.light}>
                No fallback handler set
              </Typography>
            )}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  )
}
