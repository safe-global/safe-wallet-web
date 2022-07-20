import { ReactElement } from 'react'
import { Grid } from '@mui/material'
import PendingTxsList from '../PendingTxs/PendingTxsList'
import Overview from '../Overview/Overview'
import { FeaturedApps } from '../FeaturedApps/FeaturedApps'

const Dashboard = (): ReactElement => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={12} lg={6}>
        <Overview />
      </Grid>

      <Grid item xs={12} md={6}>
        <PendingTxsList size={4} />
      </Grid>

      <FeaturedApps />
    </Grid>
  )
}

export default Dashboard
