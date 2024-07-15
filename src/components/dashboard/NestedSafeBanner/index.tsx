import { Button, Card, Grid, Typography } from '@mui/material'
import Link, { type LinkProps } from 'next/link'
import { getSafeInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { WidgetContainer, WidgetBody } from '@/components/dashboard/styled'
import SafeLogo from '@/public/images/logo-no-text.svg'
import useSafeInfo from '@/hooks/useSafeInfo'
import useAsync from '@/hooks/useAsync'
import { AppRoutes } from '@/config/routes'
import { useCurrentChain } from '@/hooks/useChains'
import { isIframe } from '@/services/safe-apps/utils'

const MAX_CHECKED_OWNERS = 3

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

  const [nestedSafeOwner] = useAsync<string | null>(async () => {
    if (!safeLoaded) return null

    if (isIframe()) return null

    const ownerAddresses = safe?.owners.slice(0, MAX_CHECKED_OWNERS).map((owner) => owner.value)

    const infos = await Promise.allSettled(
      ownerAddresses.map((ownerAddress) => getSafeInfo(safe.chainId, ownerAddress)),
    )

    const nestedSafe = infos.find((info) => info.status === 'fulfilled')

    return nestedSafe?.status === 'fulfilled' ? nestedSafe.value.address.value : null
  }, [safe, safeLoaded])

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
