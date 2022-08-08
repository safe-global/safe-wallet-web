import React from 'react'
import { Button, Divider, Grid, Paper, Typography } from '@mui/material'
import { useRouter } from 'next/router'

const NewSafe = () => {
  const router = useRouter()

  return (
    <>
      <Typography variant="h1" mb={2}>
        Welcome to the Safe.
      </Typography>
      <Typography variant="h4" mb={2}>
        Safe is the most trusted platform to manage digital assets.
        <br />
        Here is how to get started:
      </Typography>
      <Paper sx={{ padding: 3, maxWidth: '800px' }}>
        <Grid container gap={3}>
          <Grid item md={6}>
            <Typography variant="h2" mb={1}>
              Create Safe
            </Typography>
            <Typography mb={4}>
              Create a new Safe that is controlled by one or multiple owners. You will be required to pay a network fee
              for creating your new Safe.
            </Typography>
            <Button variant="contained" onClick={() => router.push('/open')}>
              + Create new Safe
            </Button>
            <Divider orientation="vertical" flexItem />
          </Grid>
          <Grid item md>
            <Typography variant="h2" mb={1}>
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
    </>
  )
}

export default NewSafe
