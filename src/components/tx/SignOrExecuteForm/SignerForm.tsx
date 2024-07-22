import { Box, MenuItem, Select } from '@mui/material'
import FieldsGrid from '../FieldsGrid'
import { useNestedSafeOwners } from '@/components/dashboard/NestedSafeBanner'
import useWallet from '@/hooks/wallets/useWallet'
import EthHashInfo from '@/components/common/EthHashInfo'

export const SignerForm = () => {
  const wallet = useWallet()
  const nestedSafeOwners = useNestedSafeOwners()

  if (!wallet) {
    return null
  }

  return (
    <FieldsGrid title="Signer">
      <Box display="flex" alignItems="center" gap={1}>
        <Select>
          <MenuItem value={wallet.address}>
            <EthHashInfo address={wallet.address} avatarSize={16} onlyName />
          </MenuItem>
          {nestedSafeOwners?.map((owner) => (
            <MenuItem key={owner.address} value={owner.address}>
              <EthHashInfo address={owner.address} avatarSize={16} onlyName />
            </MenuItem>
          ))}
        </Select>
      </Box>
    </FieldsGrid>
  )
}
