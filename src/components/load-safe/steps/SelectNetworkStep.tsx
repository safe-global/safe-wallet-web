import { Box, Button, Divider, Grid, Paper, Typography } from '@mui/material'
import type { StepRenderProps } from '@/components/tx/TxStepper/useTxStepper'
import NetworkSelector from '@/components/common/NetworkSelector'

type Props = {
  onSubmit: StepRenderProps['onSubmit']
  onBack: StepRenderProps['onBack']
}

const SelectNetworkStep = ({ onSubmit, onBack }: Props) => {
  return (
    <Paper>
      <Box padding={3}>
        <Typography component="div">
          Select network on which the Safe was created: <NetworkSelector />
        </Typography>
      </Box>
      <Divider />
      <Box padding={3}>
        <Grid container alignItems="center" justifyContent="center" spacing={3}>
          <Grid item>
            <Button onClick={() => onBack()}>Cancel</Button>
          </Grid>
          <Grid item>
            <Button variant="contained" onClick={() => onSubmit(undefined)}>
              Continue
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  )
}

export default SelectNetworkStep
