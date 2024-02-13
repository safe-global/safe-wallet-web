import CooldownButton from '@/components/common/CooldownButton'
import ExternalLink from '@/components/common/ExternalLink'
import { getCounterfactualBalance } from '@/features/counterfactual/utils'
import { useCurrentChain } from '@/hooks/useChains'
import useSafeInfo from '@/hooks/useSafeInfo'
import { useWeb3 } from '@/hooks/wallets/web3'
import { getBlockExplorerLink } from '@/utils/chains'
import { Box, Typography } from '@mui/material'

const CheckBalance = () => {
  const { safe, safeAddress } = useSafeInfo()
  const chain = useCurrentChain()
  const provider = useWeb3()

  if (safe.deployed) return null

  const handleBalanceRefresh = async () => {
    void getCounterfactualBalance(safeAddress, provider, chain, true)
  }

  const blockExplorerLink = chain ? getBlockExplorerLink(chain, safeAddress) : undefined

  return (
    <Box textAlign="center" p={3}>
      <Typography variant="h4" fontWeight="bold" mb={2}>
        Don&apos;t see your tokens?
      </Typography>
      <Box display="flex" flexDirection="column" gap={1} alignItems="center">
        <CooldownButton cooldown={15} onClick={handleBalanceRefresh}>
          Refresh balance
        </CooldownButton>
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
