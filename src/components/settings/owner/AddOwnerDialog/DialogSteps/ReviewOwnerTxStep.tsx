import EthHashInfo from '@/components/common/EthHashInfo'
import useSafeInfo from '@/hooks/useSafeInfo'
import { Box, Divider, Grid, Typography } from '@mui/material'
import css from './styles.module.css'
import type { ChangeOwnerData } from '@/components/settings/owner/AddOwnerDialog/DialogSteps/types'
import useAsync from '@/hooks/useAsync'
import { upsertAddressBookEntry } from '@/store/addressBookSlice'
import { useAppDispatch } from '@/store'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'
import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import { sameAddress } from '@/utils/addresses'
import useAddressBook from '@/hooks/useAddressBook'
import React from 'react'
import { trackEvent, SETTINGS_EVENTS } from '@/services/analytics'
import { createAddOwnerTx, createSwapOwnerTx } from '@/services/tx/tx-sender'

export const ReviewOwnerTxStep = ({ data, onSubmit }: { data: ChangeOwnerData; onSubmit: () => void }) => {
  const { safe, safeAddress } = useSafeInfo()
  const { chainId } = safe
  const dispatch = useAppDispatch()
  const addressBook = useAddressBook()
  const { newOwner, removedOwner, threshold } = data

  const [safeTx, safeTxError] = useAsync<SafeTransaction>(() => {
    if (removedOwner) {
      return createSwapOwnerTx({
        newOwnerAddress: newOwner.address,
        oldOwnerAddress: removedOwner.address,
      })
    } else {
      return createAddOwnerTx({
        ownerAddress: newOwner.address,
        threshold,
      })
    }
  }, [removedOwner, newOwner])

  const isReplace = Boolean(removedOwner)

  const addAddressBookEntryAndSubmit = () => {
    if (typeof newOwner.name !== 'undefined') {
      dispatch(
        upsertAddressBookEntry({
          chainId: chainId,
          address: newOwner.address,
          name: newOwner.name,
        }),
      )
    }

    trackEvent({ ...SETTINGS_EVENTS.SETUP.THRESHOLD, label: safe.threshold })
    trackEvent({ ...SETTINGS_EVENTS.SETUP.OWNERS, label: safe.owners.length })

    onSubmit()
  }

  return (
    <SignOrExecuteForm safeTx={safeTx} onSubmit={addAddressBookEntryAndSubmit} error={safeTxError}>
      <Grid
        container
        mt={-3}
        mb={3}
        mx={-3}
        width="auto"
        borderBottom={({ palette }) => `1px solid ${palette.border.light}`}
      >
        <Grid item md={4} pt={3} pl={3}>
          <Typography mb={3}>Details</Typography>
          <Typography variant="caption" color="text.secondary">
            Name of the Safe Account:
          </Typography>
          <Typography mb={3}>{addressBook[safeAddress] || 'No name'}</Typography>
          <Typography variant="caption" color="text.secondary">
            Any transaction requires the confirmation of:
          </Typography>
          <Typography mb={3}>
            <b>{threshold}</b> out of <b>{safe.owners.length + (isReplace ? 0 : 1)}</b> owners
          </Typography>
        </Grid>

        <Grid
          item
          xs={12}
          md={8}
          borderLeft={({ palette }) => [undefined, undefined, `1px solid ${palette.border.light}`]}
          borderTop={({ palette }) => [`1px solid ${palette.border.light}`, undefined, 'none']}
        >
          <Typography padding={3}>{safe.owners.length} Safe Account owner(s)</Typography>
          <Divider />
          <Box display="flex" flexDirection="column" gap={2} padding={3}>
            {safe.owners
              .filter((owner) => !removedOwner || !sameAddress(owner.value, removedOwner.address))
              .map((owner) => {
                return (
                  <EthHashInfo
                    key={owner.value}
                    address={owner.value}
                    shortAddress={false}
                    showCopyButton
                    hasExplorer
                  />
                )
              })}
          </Box>
          {removedOwner && (
            <>
              <div className={css.info}>
                <Typography variant="overline">Removing owner &darr;</Typography>
              </div>
              <Divider />
              <Box bgcolor="error.light" padding={2}>
                <EthHashInfo address={removedOwner.address} shortAddress={false} showCopyButton hasExplorer />
              </Box>
              <Divider />
            </>
          )}
          <div className={css.info}>
            <Typography className={css.overline}>Adding new owner &darr;</Typography>
          </div>
          <Divider />
          <Box padding={2}>
            <EthHashInfo
              name={newOwner.name}
              address={newOwner.address}
              shortAddress={false}
              showCopyButton
              hasExplorer
            />
          </Box>
        </Grid>
      </Grid>
    </SignOrExecuteForm>
  )
}
