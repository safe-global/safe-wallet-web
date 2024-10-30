import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SvgIcon,
  Tooltip,
  Typography,
  type SelectChangeEvent,
} from '@mui/material'
import { useNestedSafeOwners } from '@/hooks/useNestedSafeOwners'
import useWallet from '@/hooks/wallets/useWallet'
import EthHashInfo from '@/components/common/EthHashInfo'
import { useEffect, useMemo } from 'react'
import useSafeInfo from '@/hooks/useSafeInfo'
import { useNestedSafeAddress, setNestedSafeAddress } from '@/components/common/WalletProvider'
import TxCard from '@/components/tx-flow/common/TxCard'
import InfoIcon from '@/public/images/notifications/info.svg'
import SignatureIcon from '@/public/images/transactions/signature.svg'

import css from './styles.module.css'

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
        ? [wallet.address, ...(nestedSafeOwners?.map((owner) => owner) ?? [])]
        : nestedSafeOwners?.map((owner) => owner) ?? [],
    [isOwner, nestedSafeOwners, wallet],
  )

  useEffect(() => {
    if (nestedSafeAddress) {
      return
    }
    if (!isOwner && nestedSafeOwners && nestedSafeOwners.length > 0) {
      setNestedSafeAddress(nestedSafeOwners[0])
    }
    if (isOwner && (!nestedSafeOwners || nestedSafeOwners.length === 0)) {
      setNestedSafeAddress(undefined)
    }
  }, [isOwner, nestedSafeAddress, nestedSafeOwners])

  if (!wallet || isNotNestedOwner) {
    return null
  }

  return (
    <TxCard>
      <Typography variant="h5" display="flex" gap={1} alignItems="center">
        <SvgIcon component={SignatureIcon} inheritViewBox fontSize="small" />
        Sign with
        <Tooltip
          title="Your connected wallet controls other Safe accounts, which can sign this transaction. You can select which account to sign with."
          arrow
          placement="top"
        >
          <SvgIcon component={InfoIcon} inheritViewBox color="border" fontSize="small" />
        </Tooltip>
      </Typography>

      <Box display="flex" alignItems="center" gap={1}>
        <FormControl fullWidth size="medium">
          <InputLabel id="signer-label">Signer account</InputLabel>
          <Select
            className={css.signerForm}
            labelId="signer-label"
            label="Signer account"
            fullWidth
            onChange={onChange}
            value={nestedSafeAddress ?? options[0]}
          >
            {options?.map((owner) => (
              <MenuItem key={owner} value={owner}>
                <EthHashInfo address={owner} avatarSize={32} onlyName />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </TxCard>
  )
}
