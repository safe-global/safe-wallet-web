import type { ReactElement } from 'react'
import { Grid } from '@mui/material'
import PendingTxsList from '@/components/dashboard/PendingTxs/PendingTxsList'
import Overview from '@/components/dashboard/Overview/Overview'
import { FeaturedApps } from '@/components/dashboard/FeaturedApps/FeaturedApps'
import SafeAppsDashboardSection from '@/components/dashboard/SafeAppsDashboardSection/SafeAppsDashboardSection'
import CreationDialog from '@/components/dashboard/CreationDialog'
import { useRouter } from 'next/router'

const Dashboard = (): ReactElement => {
  const router = useRouter()
  const { showCreationModal = '' } = router.query

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12} md={12} lg={6}>
          <Overview />
        </Grid>

        <Grid item xs={12} md={12} lg={6}>
          <PendingTxsList size={4} />
        </Grid>

        <Grid item xs={12}>
          <FeaturedApps />
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
