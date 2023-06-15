import { useContext, useEffect } from 'react'
import { Grid, Typography, Divider, Box } from '@mui/material'
import { EthHashInfo } from '@safe-global/safe-react-components'

import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import useAddressBook from '@/hooks/useAddressBook'
import useSafeInfo from '@/hooks/useSafeInfo'
import { trackEvent, SETTINGS_EVENTS } from '@/services/analytics'
import { createSwapOwnerTx, createAddOwnerTx } from '@/services/tx/tx-sender'
import { useAppDispatch } from '@/store'
import { upsertAddressBookEntry } from '@/store/addressBookSlice'
import { sameAddress } from '@/utils/addresses'
import { SafeTxContext } from '../../SafeTxProvider'
import type { AddOwnerFlowProps } from '.'
import type { ReplaceOwnerFlowProps } from '../ReplaceOwner'

import css from './styles.module.css'

export const ReviewOwner = ({ params }: { params: AddOwnerFlowProps | ReplaceOwnerFlowProps }) => {
  const dispatch = useAppDispatch()
  const addressBook = useAddressBook()
  const { setSafeTx, setSafeTxError } = useContext(SafeTxContext)
  const { safe, safeAddress } = useSafeInfo()
  const { chainId } = safe
  const { newOwner, removedOwner, threshold } = params

  useEffect(() => {
    const promise = removedOwner
      ? createSwapOwnerTx({
          newOwnerAddress: newOwner.address,
          oldOwnerAddress: removedOwner.address,
        })
      : createAddOwnerTx({
          ownerAddress: newOwner.address,
          threshold,
        })

    promise.then(setSafeTx).catch(setSafeTxError)
  }, [removedOwner, newOwner, threshold, setSafeTx, setSafeTxError])

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
  }

  return (
    <SignOrExecuteForm onSubmit={addAddressBookEntryAndSubmit}>
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
            <b>{threshold}</b> out of <b>{safe.owners.length + (removedOwner ? 0 : 1)}</b> owners
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
