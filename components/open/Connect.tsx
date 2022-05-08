import React from 'react'
import { Box, Button, Divider, Grid, Paper, Typography } from '@mui/material'

const Connect = ({ onSubmit }: { onSubmit: (data: unknown) => void }) => {
  return (
    <Paper>
      <Box padding={3}>
        <Typography variant="body1">
          Select network on which to create your Safe. The app is currently pointing to NETWORK_NAME
        </Typography>
        <Button>Switch network</Button>
      </Box>
      <Divider />
      <Box padding={3}>
        <Grid container alignItems="center" justifyContent="center" spacing={3}>
          <Grid item>
            <Button>Cancel</Button>
          </Grid>
          <Grid item>
            <Button variant="contained" onClick={onSubmit}>
              Continue
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  )
}

export default Connect
