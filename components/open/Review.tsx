import React from 'react'
import { CreateSafeFormData } from '@/components/open/index'
import { Box, Button, Divider, Grid, Paper, Typography } from '@mui/material'
import { EthHashInfo } from '@gnosis.pm/safe-react-components'

const Review = ({ params }: { params: CreateSafeFormData }) => {
  const createSafe = () => {}
  return (
    <Paper>
      <Grid container>
        <Grid item md={4}>
          <Box padding={3}>
            <Typography variant="body1">Details</Typography>
            <Typography>
              Name of the new Safe
              <br />
              {params.name}
            </Typography>
            <Typography>
              Any transaction requires the confirmation of:
              <br />
              {params.threshold}
            </Typography>
          </Box>
        </Grid>
        <Grid item md={8} borderLeft="1px solid #ddd">
          <Box padding={3}>{params.owners.length} Safe owners</Box>
          <Divider />
          {params.owners.map((owner) => {
            return <EthHashInfo key={owner.address} />
          })}
          <Divider />
        </Grid>
      </Grid>
      <Box padding={3} bgcolor={(theme) => theme.palette.grey.A100}>
        <Typography textAlign="center">
          You are about to create a new Safe on NETWORK_NAME and will have to confirm a transaction with your currently
          connected wallet. The creation will cost approximately GAS_ESTIMATION. The exact amount will be determined by
          your wallet.
        </Typography>
      </Box>
      <Divider />
      <Box padding={3}>
        <Grid container alignItems="center" justifyContent="center" spacing={3}>
          <Grid item>
            <Button>Cancel</Button>
          </Grid>
          <Grid item>
            <Button variant="contained" onClick={createSafe}>
              Create
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  )
}

export default Review
