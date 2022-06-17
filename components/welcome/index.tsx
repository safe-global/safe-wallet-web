import React from 'react'
import { Box, Button, Divider, Grid, Paper, Typography } from '@mui/material'
import { useRouter } from 'next/router'

const NewSafe = () => {
  const router = useRouter()

  return (
    <Box>
      <Typography variant="h5" mb={2}>
        Welcome to Gnosis Safe.
      </Typography>
      <Typography variant="body1" mb={2}>
        Gnosis Safe is the most trusted platform to manage digital assets.
        <br />
        Here is how to get started:
      </Typography>
      <Paper sx={{ padding: 3 }}>
        <Grid container>
          <Grid item md={6}>
            <Typography variant="h5" mb={1}>
              Create Safe
            </Typography>
            <Typography variant="body1" mb={4}>
              Create a new Safe that is controlled by one or multiple owners. You will be required to pay a network fee
              for creating your new Safe.
            </Typography>
            <Button variant="contained" onClick={() => router.push('/open')}>
              + Create new Safe
            </Button>
            <Divider orientation="vertical" flexItem />
          </Grid>
          <Grid item md>
            <Typography variant="h5" mb={1}>
              Load Existing Safe
            </Typography>
            <Typography variant="body1" mb={4}>
              Already have a Safe or want to access it from a different device? Easily load your Safe using your Safe
              address.
            </Typography>
            <Button variant="outlined" onClick={() => router.push('/load')}>
              Add existing Safe
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  )
}

export default NewSafe
