import type { TransactionDetails } from '@safe-global/safe-gateway-typescript-sdk'
import EthHashInfo from '@/components/common/EthHashInfo'
import { Box, Typography } from '@mui/material'

const SwapTxInfo = ({ txData }: { txData: TransactionDetails['txData'] }) => {
  if (!txData) return null

  return (
    <Typography component="div" display="flex" alignItems="center" fontWeight="bold" gap={1}>
      <Box flexShrink="0">Interact with</Box>
      <EthHashInfo
        address={txData.to.value}
        name={txData.to.name ?? undefined}
        customAvatar={txData.to.logoUri ?? undefined}
        avatarSize={24}
        shortAddress={false}
        hasExplorer
        onlyName
      />
    </Typography>
  )
}

export default SwapTxInfo
