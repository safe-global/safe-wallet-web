import EthHashInfo from '@/components/common/EthHashInfo'
import useSafeInfo from '@/hooks/useSafeInfo'
import { Box, Divider, Grid, Typography } from '@mui/material'
import css from './styles.module.css'
import { ChangeOwnerData } from '@/components/settings/owner/AddOwnerDialog/DialogSteps/types'
import { createAddOwnerTx, createSwapOwnerTx } from '@/services/tx/txSender'
import useAsync from '@/hooks/useAsync'
import { upsertAddressBookEntry } from '@/store/addressBookSlice'
import { useAppDispatch } from '@/store'
import { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'
import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import { sameAddress } from '@/utils/addresses'
import useAddressBook from '@/hooks/useAddressBook'
import React from 'react'

export const ReviewOwnerTxStep = ({ data, onSubmit }: { data: ChangeOwnerData; onSubmit: (data: null) => void }) => {
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

  const addAddressBookEntryAndSubmit = (dialogData: null) => {
    if (typeof newOwner.name !== 'undefined') {
      dispatch(
        upsertAddressBookEntry({
          chainId: chainId,
          address: newOwner.address,
          name: newOwner.name,
        }),
      )
    }

    onSubmit(dialogData)
  }

  return (
    <SignOrExecuteForm
      safeTx={safeTx}
      onSubmit={addAddressBookEntryAndSubmit}
      isExecutable={safe.threshold === 1}
      error={safeTxError}
    >
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
            Name of the Safe:
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
          <Typography padding={3}>{safe.owners.length} Safe owner(s)</Typography>
          <Divider />
          <Box display="flex" flexDirection="column" gap={2} padding={3}>
            {safe.owners
              .filter((owner) => !removedOwner || !sameAddress(owner.value, removedOwner.address))
              .map((owner) => {
                return <EthHashInfo key={owner.value} address={owner.value} shortAddress={false} />
              })}
          </Box>
          {removedOwner && (
            <>
              <div className={css.info}>
                <Typography variant="overline">Removing owner &darr;</Typography>
              </div>
              <Divider />
              <Box bgcolor="error.light" padding={2}>
                <EthHashInfo address={removedOwner.address} shortAddress={false} />
              </Box>
              <Divider />
            </>
          )}
          <div className={css.info}>
            <Typography className={css.overline}>Adding new owner &darr;</Typography>
          </div>
          <Divider />
          <Box padding={2}>
            <EthHashInfo address={newOwner.address} shortAddress={false} />
          </Box>
        </Grid>
      </Grid>
    </SignOrExecuteForm>
  )
}
