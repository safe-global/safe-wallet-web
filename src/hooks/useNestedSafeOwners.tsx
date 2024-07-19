import { Button, Card, Grid, Typography } from '@mui/material'
import { WidgetContainer, WidgetBody } from '@/components/dashboard/styled'
import SafeLogo from '@/public/images/logo-no-text.svg'
import useSafeInfo from '@/hooks/useSafeInfo'
import useAllSafes from '@/components/welcome/MyAccounts/useAllSafes'
import { useMemo } from 'react'
import { setNestedSafeAddress } from '@/components/common/WalletProvider'

const Banner = ({ onClick }: { onClick: () => void }) => {
  return (
    <WidgetContainer>
      <WidgetBody>
        <Card sx={{ py: 3, px: 4 }}>
          <Grid
            container
            display="flex"
            alignItems={{ xs: 'flex-start', md: 'center' }}
            gap={3}
            flexDirection={{ xs: 'column', md: 'row' }}
          >
            <Grid item>
              <SafeLogo alt="Safe logo" width="40" height="40" />
            </Grid>

            <Grid item xs>
              <Typography variant="h6" fontWeight={700} mb={1}>
                Nested Safe Account
              </Typography>

              <Typography color="primary.light" mb={1}>
                This Safe Account is owned by another Safe Account.
              </Typography>
            </Grid>

            <Grid item>
              <Button variant="contained" color="primary" onClick={onClick}>
                Open in parent Safe
              </Button>
            </Grid>
          </Grid>
        </Card>
      </WidgetBody>
    </WidgetContainer>
  )
}

export const useNestedSafeOwners = () => {
  const { safe, safeLoaded } = useSafeInfo()
  const allOwned = useAllSafes()

  const nestedSafeOwner = useMemo(() => {
    if (!safeLoaded || !allOwned) return null

    // Find an intersection of owned safes and the owners of the current safe
    const ownerAddresses = safe?.owners.map((owner) => owner.value)

    return allOwned.filter(
      (ownedSafe) =>
        !ownedSafe.isWatchlist && ownedSafe.chainId === safe.chainId && ownerAddresses?.includes(ownedSafe.address),
    )
  }, [allOwned, safe, safeLoaded])

  return nestedSafeOwner
}

const NestedSafeBanner = () => {
  const nestedSafeOwners = useNestedSafeOwners()

  if (!nestedSafeOwners || nestedSafeOwners.length === 0) return null

  return <Banner onClick={() => setNestedSafeAddress(nestedSafeOwners[0]?.address)} />
}

export default NestedSafeBanner
