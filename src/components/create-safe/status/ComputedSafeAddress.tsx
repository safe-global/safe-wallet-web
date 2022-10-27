import { Box, Skeleton, Typography } from '@mui/material'
import EthHashInfo from '@/components/common/EthHashInfo'

const ComputedSafeAddress = ({ safeAddress }: { safeAddress?: string }) => {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" px={3}>
      <Typography>Your safe will have the following address after creation:</Typography>
      {safeAddress ? (
        <EthHashInfo address={safeAddress} hasExplorer shortAddress={false} showCopyButton />
      ) : (
        <Skeleton variant="rounded" width="30em" height={40} />
      )}
    </Box>
  )
}

export default ComputedSafeAddress
