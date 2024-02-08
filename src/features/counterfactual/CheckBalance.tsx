import ExternalLink from '@/components/common/ExternalLink'
import { useCurrentChain } from '@/hooks/useChains'
import useSafeInfo from '@/hooks/useSafeInfo'
import { getBlockExplorerLink } from '@/utils/chains'
import { Box, Button, Typography } from '@mui/material'

const CheckBalance = () => {
  const { safe, safeAddress } = useSafeInfo()
  const chain = useCurrentChain()

  if (safe.deployed) return null

  const handleBalanceRefresh = () => {
    // TODO: Call external store from getCounterfactualBalance
  }

  const blockExplorerLink = chain ? getBlockExplorerLink(chain, safeAddress) : undefined

  return (
    <Box textAlign="center" p={3}>
      <Typography variant="h4" fontWeight="bold" mb={2}>
        Don&apos;t see your tokens?
      </Typography>
      <Box display="flex" flexDirection="column" gap={1} alignItems="center">
        <Button href="#" onClick={handleBalanceRefresh} variant="contained" size="small">
          Refresh balance
        </Button>
        <Typography>or</Typography>
        {blockExplorerLink && (
          <Typography>
            check on <ExternalLink href={blockExplorerLink.href}>Block Explorer</ExternalLink>
          </Typography>
        )}
      </Box>
    </Box>
  )
}

export default CheckBalance
