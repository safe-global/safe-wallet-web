import EthHashInfo from '@/components/common/EthHashInfo'
import { Stack, Typography } from '@mui/material'

import css from './styles.module.css'
import useAsync from '@/hooks/useAsync'
import { getContract } from '@safe-global/safe-gateway-typescript-sdk'
import useChainId from '@/hooks/useChainId'
export const SpenderField = ({ address }: { address: string }) => {
  const chainId = useChainId()
  const [spendingContract] = useAsync(() => getContract(chainId, address), [chainId, address])

  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2} className={css.approvalField}>
      <Typography variant="body2" color="text.secondary">
        Spender
      </Typography>
      <div>
        {/* TODO: set to name only once merged with swap changes */}
        <EthHashInfo
          avatarSize={24}
          address={address}
          name={spendingContract?.displayName || spendingContract?.name}
          customAvatar={spendingContract?.logoUri}
          hasExplorer
        />
      </div>
    </Stack>
  )
}
