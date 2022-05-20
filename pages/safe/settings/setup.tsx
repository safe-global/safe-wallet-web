import { ContractVersion } from '@/components/settings/ContractVersion'
import { OwnerList } from '@/components/settings/owner/OwnerList'
import { RequiredConfirmation } from '@/components/settings/RequiredConfirmations'
import useAddressBook from '@/services/useAddressBook'
import useSafeInfo from '@/services/useSafeInfo'
import { Grid, Paper, Typography } from '@mui/material'
import type { NextPage } from 'next'

const Setup: NextPage = () => {
  const { safe } = useSafeInfo()
  const version = safe?.version
  const nonce = safe?.nonce
  const ownerLength = safe?.owners.length ?? 0
  const threshold = safe?.threshold ?? 0
  const addressBook = useAddressBook()
  const namedOwners = safe?.owners.map((owner) => ({
    address: owner.value,
    name: addressBook[owner.value],
  }))

  return (
    <main>
      <h2>Settings / Setup</h2>
      <Grid container spacing={2}>
        <Grid item xs={8}>
          <Paper>
            <Grid item>
              <OwnerList owners={namedOwners ?? []} isGranted={true} chainId={safe?.chainId} />
            </Grid>
            <Grid item xs>
              <RequiredConfirmation threshold={threshold} owners={ownerLength} />
            </Grid>
          </Paper>
        </Grid>
        <Grid item>
          <Grid item xs>
            <h3>Safe Nonce</h3>
            <Typography>Current Nonce: {nonce}</Typography>
          </Grid>
          <Grid item xs>
            <ContractVersion />
          </Grid>
        </Grid>
      </Grid>
    </main>
  )
}

export default Setup
