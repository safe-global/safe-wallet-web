import { getDelegates } from '@safe-global/safe-gateway-typescript-sdk'
import useAsync from '@/hooks/useAsync'
import useSafeInfo from '@/hooks/useSafeInfo'
import { Box, Grid, Paper, SvgIcon, Tooltip, Typography } from '@mui/material'
import EthHashInfo from '@/components/common/EthHashInfo'
import InfoIcon from '@/public/images/notifications/info.svg'
import ExternalLink from '@/components/common/ExternalLink'
import { HelpCenterArticle } from '@/config/constants'

const useDelegates = () => {
  const {
    safe: { chainId },
    safeAddress,
  } = useSafeInfo()
  const [delegates] = useAsync(() => {
    if (!chainId || !safeAddress) return
    return getDelegates(chainId, { safe: safeAddress })
  }, [chainId, safeAddress])
  return delegates
}

const DelegatesList = () => {
  const delegates = useDelegates()

  if (!delegates?.results.length) return null

  return (
    <Paper sx={{ p: 4, mt: 2 }}>
      <Box display="flex" flexDirection="column" gap={2}>
        <Grid container spacing={3}>
          <Grid item lg={4} xs={12}>
            <Typography variant="h4" fontWeight={700}>
              <Tooltip
                placement="top"
                title={
                  <>
                    What are delegated accounts?{' '}
                    <ExternalLink href={HelpCenterArticle.DELEGATES}>Learn more</ExternalLink>
                  </>
                }
              >
                <span>
                  Delegated accounts
                  <SvgIcon
                    component={InfoIcon}
                    inheritViewBox
                    fontSize="small"
                    color="border"
                    sx={{ verticalAlign: 'middle', ml: 0.5 }}
                  />
                </span>
              </Tooltip>
            </Typography>
          </Grid>

          <Grid item xs>
            <ul style={{ padding: 0, margin: 0 }}>
              {delegates.results.map((item) => (
                <li
                  key={item.delegate}
                  style={{ listStyleType: 'none', marginBottom: '1em' }}
                  title={`Delegated by ${item.delegator}`}
                >
                  <EthHashInfo
                    address={item.delegate}
                    showCopyButton
                    hasExplorer
                    name={item.label || undefined}
                    shortAddress={false}
                  />
                </li>
              ))}
            </ul>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  )
}

export default DelegatesList
