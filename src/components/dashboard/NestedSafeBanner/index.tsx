import { Button, Card, Grid, Typography } from '@mui/material'
import Link, { type LinkProps } from 'next/link'
import { WidgetContainer, WidgetBody } from '@/components/dashboard/styled'
import SafeLogo from '@/public/images/logo-no-text.svg'
import useSafeInfo from '@/hooks/useSafeInfo'
import { AppRoutes } from '@/config/routes'
import { useCurrentChain } from '@/hooks/useChains'
import { isIframe } from '@/services/safe-apps/utils'
import useAllSafes from '@/components/welcome/MyAccounts/useAllSafes'
import { useMemo } from 'react'

const Banner = ({ parentSafeLink }: { parentSafeLink: LinkProps['href'] }) => {
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
              <Link href={parentSafeLink}>
                <Button variant="contained" color="primary">
                  Open in parent Safe
                </Button>
              </Link>
            </Grid>
          </Grid>
        </Card>
      </WidgetBody>
    </WidgetContainer>
  )
}

const useNestedSafeOwner = () => {
  const { safe, safeLoaded } = useSafeInfo()
  const allOwned = useAllSafes()

  const nestedSafeOwner = useMemo(() => {
    if (!safeLoaded || !allOwned || isIframe()) return null

    // Find an intersection of owned safes and the owners of the current safe
    const ownerAddresses = safe?.owners.map((owner) => owner.value)

    const match = allOwned.find(
      (ownedSafe) => ownedSafe.chainId === safe.chainId && ownerAddresses?.includes(ownedSafe.address),
    )

    return match?.address
  }, [allOwned, safe, safeLoaded])

  return nestedSafeOwner
}

const NestedSafeBanner = () => {
  const nestedSafeOwner = useNestedSafeOwner()
  const chain = useCurrentChain()

  if (!nestedSafeOwner) return null

  const parentSafeLink = {
    pathname: AppRoutes.apps.open,
    query: {
      safe: `${chain?.shortName}:${nestedSafeOwner}`,
      appUrl: window.location.href,
    },
  }

  return <Banner parentSafeLink={parentSafeLink} />
}

export default NestedSafeBanner
