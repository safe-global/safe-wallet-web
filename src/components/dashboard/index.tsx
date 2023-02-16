import type { ReactElement } from 'react'
import { Grid } from '@mui/material'
import PendingTxsList from '@/components/dashboard/PendingTxs/PendingTxsList'
import Overview from '@/components/dashboard/Overview/Overview'
import CreationDialog from '@/components/dashboard/CreationDialog'
import { useRouter } from 'next/router'
import StreamsList from './StreamsSection/StreamsList'

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
        <Grid item xs={12} md={12} lg={6}>
          <StreamsList />
        </Grid>
      </Grid>
      {showCreationModal ? <CreationDialog /> : null}
    </>
  )
}

export default Dashboard
