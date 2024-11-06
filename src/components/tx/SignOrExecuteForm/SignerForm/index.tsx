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
import { useWalletContext } from '@/hooks/wallets/useWallet'
import EthHashInfo from '@/components/common/EthHashInfo'
import { useCallback, useContext, useMemo } from 'react'
import useSafeInfo from '@/hooks/useSafeInfo'
import TxCard from '@/components/tx-flow/common/TxCard'
import InfoIcon from '@/public/images/notifications/info.svg'
import SignatureIcon from '@/public/images/transactions/signature.svg'

import css from './styles.module.css'
import { sameAddress } from '@/utils/addresses'
import { SafeTxContext } from '@/components/tx-flow/SafeTxProvider'
import useAvailableSigners from '@/hooks/wallets/useAvailableSigner'
import { MODALS_EVENTS, trackEvent } from '@/services/analytics'

export const SignerForm = () => {
  const { signer, setSignerAddress, connectedWallet: wallet } = useWalletContext() ?? {}
  const nestedSafeOwners = useNestedSafeOwners()
  const signerAddress = signer?.address
  const { safe } = useSafeInfo()
  const { safeTx } = useContext(SafeTxContext)

  const availableSigners = useAvailableSigners(safeTx, safe)

  const onChange = (event: SelectChangeEvent<string>) => {
    trackEvent(MODALS_EVENTS.CHANGE_SIGNER)
    setSignerAddress?.(event.target.value)
  }

  const isNotNestedOwner = useMemo(() => nestedSafeOwners && nestedSafeOwners.length === 0, [nestedSafeOwners])
  const isOptionEnabled = useCallback(
    (address: string) => availableSigners.some((available) => sameAddress(available, address)),
    [availableSigners],
  )

  const options = useMemo(
    () =>
      wallet
        ? [wallet.address, ...(nestedSafeOwners ?? [])].filter((address) =>
            safe.owners.some((owner) => sameAddress(owner.value, address)),
          )
        : [],
    [nestedSafeOwners, safe.owners, wallet],
  )

  if (!wallet || isNotNestedOwner) {
    return null
  }

  return (
    <TxCard>
      <Typography variant="h5" display="flex" gap={1} alignItems="center">
        <SvgIcon component={SignatureIcon} inheritViewBox fontSize="small" />
        Sign with
        <Tooltip
          title="Your connected wallet controls other Safe Accounts, which can sign this transaction. You can select which Account to sign with."
          arrow
          placement="top"
        >
          <SvgIcon component={InfoIcon} inheritViewBox color="border" fontSize="small" />
        </Tooltip>
      </Typography>

      <Box display="flex" alignItems="center" gap={1}>
        <FormControl fullWidth size="medium">
          <InputLabel id="signer-label">Signer Account</InputLabel>
          <Select
            className={css.signerForm}
            labelId="signer-label"
            label="Signer account"
            fullWidth
            onChange={onChange}
            value={signerAddress ?? options[0]}
          >
            {options?.map((owner) => (
              <MenuItem key={owner} value={owner} disabled={!isOptionEnabled(owner)}>
                <EthHashInfo address={owner} avatarSize={32} onlyName />
                {!isOptionEnabled(owner) && (
                  <Typography variant="caption" component="span" className={css.disabledPill}>
                    Already signed
                  </Typography>
                )}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </TxCard>
  )
}
