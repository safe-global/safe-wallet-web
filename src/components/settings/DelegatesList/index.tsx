import { getDelegates } from '@safe-global/safe-gateway-typescript-sdk'
import useAsync from '@/hooks/useAsync'
import useSafeInfo from '@/hooks/useSafeInfo'
import { Box, Grid, Paper, Typography } from '@mui/material'
import PrefixedEthHashInfo from '@/components/common/EthHashInfo'

const useDelegates = () => {
  const {
    safe: { chainId },
    safeAddress,
  } = useSafeInfo()
  const [delegates] = useAsync(() => getDelegates(chainId, { safe: safeAddress }), [chainId, safeAddress])
  return delegates
}

const DelegatesList = () => {
  const delegates = useDelegates()

  if (!delegates) return null

  return (
    <Paper sx={{ p: 4, mt: 2 }}>
      <Box display="flex" flexDirection="column" gap={2}>
        <Grid container spacing={3}>
          <Grid item lg={4} xs={12}>
            <Typography variant="h4" fontWeight={700}>
              Delegated accounts
            </Typography>
          </Grid>

          <Grid item xs>
            <ul style={{ padding: 0, margin: 0 }}>
              {(delegates?.results || []).map((item) => (
                <li
                  key={item.delegate}
                  style={{ listStyleType: 'none', marginBottom: '1em' }}
                  title={`Delegated by ${item.delegator}`}
                >
                  <PrefixedEthHashInfo
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
