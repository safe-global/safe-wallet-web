import EthHashInfo from '@/components/common/EthHashInfo'
import useSafeInfo from '@/hooks/useSafeInfo'
import { Box, Divider, Grid, Typography } from '@mui/material'
import css from './styles.module.css'
import useAsync from '@/hooks/useAsync'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'
import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import { sameAddress } from '@/utils/addresses'
import useAddressBook from '@/hooks/useAddressBook'
import type { RemoveOwnerData } from '..'
import React from 'react'
import { trackEvent, SETTINGS_EVENTS } from '@/services/analytics'
import { createRemoveOwnerTx } from '@/services/tx/tx-sender'

export const ReviewRemoveOwnerTxStep = ({ data, onSubmit }: { data: RemoveOwnerData; onSubmit: () => void }) => {
  const { safe, safeAddress } = useSafeInfo()
  const addressBook = useAddressBook()
  const { removedOwner, threshold } = data

  const [safeTx, safeTxError] = useAsync<SafeTransaction | undefined>(async () => {
    return createRemoveOwnerTx({ ownerAddress: removedOwner.address, threshold })
  }, [removedOwner.address, threshold])

  const newOwnerLength = safe.owners.length - 1

  const onFormSubmit = () => {
    trackEvent({ ...SETTINGS_EVENTS.SETUP.THRESHOLD, label: safe.threshold })
    trackEvent({ ...SETTINGS_EVENTS.SETUP.OWNERS, label: safe.owners.length })

    onSubmit()
  }

  return (
    <SignOrExecuteForm safeTx={safeTx} onSubmit={onFormSubmit} error={safeTxError}>
      <Grid
        container
        mt={-3}
        mb={2}
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
            <b>{threshold}</b> out of <b>{newOwnerLength}</b> owners
          </Typography>
        </Grid>

        <Grid
          item
          xs={12}
          md={8}
          borderLeft={({ palette }) => [undefined, undefined, `1px solid ${palette.border.light}`]}
          borderTop={({ palette }) => [`1px solid ${palette.border.light}`, undefined, 'none']}
        >
          <Typography p={3}>{newOwnerLength} Safe owner(s)</Typography>
          <Divider />
          {safe.owners
            .filter((owner) => !sameAddress(owner.value, removedOwner.address))
            .map((owner) => (
              <div key={owner.value}>
                <Box padding={2} key={owner.value}>
                  <EthHashInfo address={owner.value} shortAddress={false} showCopyButton hasExplorer />
                </Box>
                <Divider />
              </div>
            ))}
          {
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
          }
        </Grid>
      </Grid>
    </SignOrExecuteForm>
  )
}
