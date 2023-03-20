import { Card, Grid } from '@mui/material'
import Navigator from '@/components/relaying-education-series/Navigator'

const WhatIsRelaying = () => {
  return (
    <Grid container spacing={3} sx={{ margin: '86px 113px' }}>
      <Grid item width="648px">
        <Card>
          <h1>What is relaying</h1>
        </Card>
      </Grid>
      <Grid item>
        <Card>
          <Navigator />
        </Card>
      </Grid>
    </Grid>
  )
}

export default WhatIsRelaying
