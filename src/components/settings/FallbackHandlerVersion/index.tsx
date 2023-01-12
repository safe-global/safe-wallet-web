import { Typography } from '@mui/material'

import { sameAddress } from '@/utils/addresses'

import useSafeInfo from '@/hooks/useSafeInfo'

import UpdateSafeDialog from './SetFallbackHandlerDialog'
import PrefixedEthHashInfo from '@/components/common/EthHashInfo'
import { getFallbackHandlerContractDeployment } from '@/services/contracts/safeContracts'

export const FallbackHandlerVersion = ({ isGranted }: { isGranted: boolean }) => {
  const { safe } = useSafeInfo()

  const fallbackHandlerAddress = safe.fallbackHandler?.value

  const preferredFallbackHandlerContractInstance = safe.version
    ? getFallbackHandlerContractDeployment(safe.chainId, safe.version)
    : undefined
  const preferredFallbackHandlerAddress = preferredFallbackHandlerContractInstance?.networkAddresses[safe.chainId]
  const shouldUpdate =
    preferredFallbackHandlerAddress && !sameAddress(fallbackHandlerAddress, preferredFallbackHandlerAddress)

  const fallbackHandlerName =
    safe.fallbackHandler?.name ?? !shouldUpdate ? preferredFallbackHandlerContractInstance?.contractName : 'Unknown'

  return (
    <div>
      <Typography variant="h4" fontWeight={700} marginBottom={1}>
        Fallback handler
      </Typography>
      {fallbackHandlerAddress ? (
        <PrefixedEthHashInfo avatarSize={32} address={fallbackHandlerAddress} name={fallbackHandlerName} hasExplorer />
      ) : (
        <Typography>No fallback handler set</Typography>
      )}

      {shouldUpdate && isGranted && <UpdateSafeDialog />}
    </div>
  )
}
