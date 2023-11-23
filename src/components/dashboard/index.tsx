import type { ReactElement } from 'react'
import { Grid } from '@mui/material'
import PendingTxsList from '@/components/dashboard/PendingTxs/PendingTxsList'
import Overview from '@/components/dashboard/Overview/Overview'
import { FeaturedApps } from '@/components/dashboard/FeaturedApps/FeaturedApps'
import SafeAppsDashboardSection from '@/components/dashboard/SafeAppsDashboardSection/SafeAppsDashboardSection'
import GovernanceSection from '@/components/dashboard/GovernanceSection/GovernanceSection'
import CreationDialog from '@/components/dashboard/CreationDialog'
import { useRouter } from 'next/router'
import { Recovery } from './Recovery'
import { FEATURES } from '@/utils/chains'
import { useHasFeature } from '@/hooks/useChains'
import { CREATION_MODAL_QUERY_PARM } from '../new-safe/create/logic'
import { RecoveryHeader } from './RecoveryHeader'

const Dashboard = (): ReactElement => {
  const router = useRouter()
  const supportsRecovery = useHasFeature(FEATURES.RECOVERY)
  const { [CREATION_MODAL_QUERY_PARM]: showCreationModal = '' } = router.query

  return (
    <>
      <Grid container spacing={3}>
        <RecoveryHeader />

        <Grid item xs={12} lg={6}>
          <Overview />
        </Grid>

        <Grid item xs={12} lg={6}>
          <PendingTxsList />
        </Grid>

        <Grid item xs={12} lg={supportsRecovery ? 6 : undefined}>
          <FeaturedApps stackedLayout={!!supportsRecovery} />
        </Grid>

        {supportsRecovery ? (
          <Grid item xs={12} lg={6}>
            <Recovery />
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
