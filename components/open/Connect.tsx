import React from 'react'
import { Box, Button, Divider, Grid, Paper, Typography } from '@mui/material'
import { StepRenderProps } from '@/components/tx/TxStepper'

type Props = {
  onSubmit: StepRenderProps['onSubmit']
  onBack: StepRenderProps['onBack']
}

const Connect = ({ onSubmit, onBack }: Props) => {
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
            <Button onClick={onBack}>Cancel</Button>
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
