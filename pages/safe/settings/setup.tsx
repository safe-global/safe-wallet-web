import { ContractVersion } from '@/components/settings/ContractVersion'
import { OwnerList } from '@/components/settings/owner/OwnerList'
import { RequiredConfirmation } from '@/components/settings/RequiredConfirmations'
import { sameAddress } from '@/services/addresses'
import useAddressBook from '@/services/useAddressBook'
import useChainId from '@/services/useChainId'
import useSafeInfo from '@/services/useSafeInfo'
import useWallet from '@/services/wallets/useWallet'
import { Grid, Paper, Typography } from '@mui/material'
import type { NextPage } from 'next'

const Setup: NextPage = () => {
  const { safe } = useSafeInfo()
  const nonce = safe?.nonce
  const ownerLength = safe?.owners.length ?? 0
  const threshold = safe?.threshold ?? 0
  const addressBook = useAddressBook()

  const wallet = useWallet()
  const chainId = useChainId()

  const isOwner =
    Boolean(wallet?.address) && Boolean(safe?.owners.some((owner) => sameAddress(owner.value, wallet?.address)))
  const isCorrectChain = chainId === safe?.chainId && chainId === wallet?.chainId
  const isGranted = isOwner && isCorrectChain

  const namedOwners = safe?.owners.map((owner) => ({
    address: owner.value,
    name: addressBook[owner.value],
  }))

  return (
    <main>
      <Typography variant="h2">Settings / Setup</Typography>
      <Grid container spacing={2}>
        <Grid item xs={8}>
          <Paper>
            <Grid item>
              <OwnerList owners={namedOwners ?? []} isGranted={isGranted} chainId={chainId} />
            </Grid>
            <Grid item xs>
              <RequiredConfirmation threshold={threshold} owners={ownerLength} isGranted={isGranted} />
            </Grid>
          </Paper>
        </Grid>
        <Grid item>
          <Grid item xs>
            <Typography variant="h3">Safe Nonce</Typography>
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
