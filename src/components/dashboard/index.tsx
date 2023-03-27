import type { ReactElement } from 'react'
import { Grid } from '@mui/material'
import PendingTxsList from '@/components/dashboard/PendingTxs/PendingTxsList'
import Overview from '@/components/dashboard/Overview/Overview'
import { FeaturedApps } from '@/components/dashboard/FeaturedApps/FeaturedApps'
import SafeAppsDashboardSection from '@/components/dashboard/SafeAppsDashboardSection/SafeAppsDashboardSection'
import GovernanceSection from '@/components/dashboard/GovernanceSection/GovernanceSection'
import CreationDialog from '@/components/dashboard/CreationDialog'
import { useRouter } from 'next/router'
import Relaying from '@/components/dashboard/Relaying'
import { useCurrentChain } from '@/hooks/useChains'
import { FEATURES, hasFeature } from '@/utils/chains'

const Dashboard = (): ReactElement => {
  const router = useRouter()
  const currentChain = useCurrentChain()
  const supportsRelaying = currentChain && hasFeature(currentChain, FEATURES.RELAYING)
  const { showCreationModal = '' } = router.query

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <Overview />
        </Grid>

        <Grid item xs={12} lg={6}>
          <PendingTxsList size={4} />
        </Grid>

        <Grid item xs={12} lg={supportsRelaying ? 6 : undefined}>
          <FeaturedApps />
        </Grid>

        {supportsRelaying ? (
          <Grid item xs={12} lg={6}>
            <Relaying />
          </Grid>
        ) : null}

        <Grid item xs={12}>
          <GovernanceSection />
        </Grid>

        <Grid item xs={12}>
          <SafeAppsDashboardSection />
        </Grid>
      </Grid>
      {showCreationModal ? <CreationDialog /> : null}
    </>
  )
}

export default Dashboard
