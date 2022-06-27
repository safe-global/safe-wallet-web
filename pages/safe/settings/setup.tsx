import { ContractVersion } from '@/components/settings/ContractVersion'
import { OwnerList } from '@/components/settings/owner/OwnerList'
import { RequiredConfirmation } from '@/components/settings/RequiredConfirmations'
import { sameAddress } from '@/utils/addresses'
import useAddressBook from '@/hooks/useAddressBook'
import useChainId from '@/hooks/useChainId'
import useSafeInfo from '@/hooks/useSafeInfo'
import useWallet, { useIsWrongChain } from '@/hooks/wallets/useWallet'
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
  const isWrongChain = useIsWrongChain()

  const isOwner =
    Boolean(wallet?.address) && Boolean(safe?.owners.some((owner) => sameAddress(owner.value, wallet?.address)))
  const isGranted = isOwner && !isWrongChain

  const namedOwners = safe?.owners.map((owner) => ({
    address: owner.value,
    name: addressBook[owner.value],
  }))

  return (
    <main>
      <Typography variant="h2">Settings / Setup</Typography>
      <Grid container spacing={7}>
        <Grid item xs={8}>
          <Paper>
            <Grid container padding="40px 48px 32px 32px">
              <Grid item xs={12}>
                <OwnerList owners={namedOwners ?? []} isGranted={isGranted} chainId={chainId} />
              </Grid>
              <Grid item xs={12} marginTop={7}>
                <RequiredConfirmation threshold={threshold} owners={ownerLength} isGranted={isGranted} />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item>
          <Grid item xs>
            <Typography variant="h4" fontWeight={700} paddingTop="48px">
              Safe Nonce
            </Typography>
            <Typography paddingTop={1}>Current Nonce: {nonce}</Typography>
          </Grid>
          <Grid item xs marginTop="64px">
            <ContractVersion />
          </Grid>
        </Grid>
      </Grid>
    </main>
  )
}

export default Setup
