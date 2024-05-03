import EthHashInfo from '@/components/common/EthHashInfo'
import { Stack, Typography, useMediaQuery, useTheme } from '@mui/material'

import css from './styles.module.css'
import useAsync from '@/hooks/useAsync'
import useChainId from '@/hooks/useChainId'
import { getContract } from '@safe-global/safe-gateway-typescript-sdk'

export const SpenderField = ({ address }: { address: string }) => {
  const chainId = useChainId()
  const [spendingContract] = useAsync(() => getContract(chainId, address), [chainId, address])
  const { breakpoints } = useTheme()
  const isSmallScreen = useMediaQuery(breakpoints.down('md'))

  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2} className={css.approvalField}>
      <Typography variant="body2" color="text.secondary">
        Spender
      </Typography>
      <div>
        <EthHashInfo
          avatarSize={24}
          address={address}
          name={spendingContract?.displayName || spendingContract?.name}
          customAvatar={spendingContract?.logoUri}
          shortAddress={isSmallScreen}
          hasExplorer
        />
      </div>
    </Stack>
  )
}
