import { Box, MenuItem, Select, type SelectChangeEvent } from '@mui/material'
import FieldsGrid from '../FieldsGrid'
import { useNestedSafeOwners } from '@/hooks/useNestedSafeOwners'
import useWallet from '@/hooks/wallets/useWallet'
import EthHashInfo from '@/components/common/EthHashInfo'
import { useEffect, useMemo } from 'react'
import useSafeInfo from '@/hooks/useSafeInfo'
import { useNestedSafeAddress, setNestedSafeAddress } from '@/components/common/WalletProvider'

export const SignerForm = () => {
  const wallet = useWallet()
  const nestedSafeOwners = useNestedSafeOwners()
  const nestedSafeAddress = useNestedSafeAddress()
  const { safe } = useSafeInfo()

  const onChange = (event: SelectChangeEvent<string>) => {
    setNestedSafeAddress(event.target.value)
  }

  const isOwner = useMemo(
    () => safe.owners.map((owner) => owner.value).includes(wallet?.address ?? ''),
    [wallet?.address, safe.owners],
  )

  const isNotNestedOwner = useMemo(() => nestedSafeOwners && nestedSafeOwners.length === 0, [nestedSafeOwners])

  const options = useMemo(
    () =>
      isOwner && wallet
        ? [wallet.address, ...(nestedSafeOwners?.map((owner) => owner.address) ?? [])]
        : nestedSafeOwners?.map((owner) => owner.address) ?? [],
    [isOwner, nestedSafeOwners, wallet],
  )

  useEffect(() => {
    if (nestedSafeAddress) {
      return
    }
    if (!isOwner && nestedSafeOwners && nestedSafeOwners.length > 0) {
      setNestedSafeAddress(nestedSafeOwners[0].address)
    }
    if (isOwner && (!nestedSafeOwners || nestedSafeOwners.length === 0)) {
      setNestedSafeAddress(undefined)
    }
  }, [isOwner, nestedSafeAddress, nestedSafeOwners])

  if (!wallet || isNotNestedOwner) {
    return null
  }

  return (
    <FieldsGrid title="Signer">
      <Box display="flex" alignItems="center" gap={1}>
        <Select onChange={onChange} value={nestedSafeAddress ?? options[0]}>
          {options?.map((owner) => (
            <MenuItem key={owner} value={owner}>
              <EthHashInfo address={owner} avatarSize={16} onlyName />
            </MenuItem>
          ))}
        </Select>
      </Box>
    </FieldsGrid>
  )
}
